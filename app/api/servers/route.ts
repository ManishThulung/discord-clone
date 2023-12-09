import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const { name, imageUrl } = await req.json();

    const server = await db.server.create({
      data: {
        name,
        imageUrl,
        inviteCode: uuidv4(),
        profileId: profile?.id,
        members: {
          create: {
            profileId: profile?.id,
            role: MemberRole?.ADMIN,
          },
        },
        channels: {
          create: {
            profileId: profile?.id,
            name: "# general",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("Server create error");
    return new NextResponse("Internal server error", { status: 500 });
  }
}
