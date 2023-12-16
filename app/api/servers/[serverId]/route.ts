import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    const { name, imageUrl } = await req.json();

    const server = await db.server.findFirstOrThrow({
      where: {
        profileId: profile.id,
        id: params.serverId,
      },
    });
    const updateServer = await db.server.update({
      where: {
        profileId: profile.id,
        id: params.serverId,
      },
      data: {
        name,
        imageUrl,
      },
    });

    return NextResponse.json(updateServer);
  } catch (error) {
    console.log("Server update error");
    return new NextResponse("Internal server error", { status: 500 });
  }
}
