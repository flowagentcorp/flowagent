import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/session";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { full_name, email, phone } = await req.json();

    // Validation
    if (!full_name || !email) {
      return NextResponse.json(
        { error: "Full name and email are required" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("agents")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Generate unique agent ID
    const agent_id = crypto.randomUUID();

    // Create agent in database
    const { error: insertError } = await supabase.from("agents").insert({
      id: agent_id,
      full_name,
      email,
      phone: phone || null,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Database insertion error:", insertError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    // Create session
    const res = NextResponse.json({ 
      success: true, 
      agent_id,
      message: "Account created successfully" 
    });
    
    const session = await getSession(req, res);
    session.user = {
      agent_id,
      email,
    };

    await session.save();
    return res;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
