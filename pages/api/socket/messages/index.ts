import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

const index = async (req: NextApiRequest, res: NextApiResponseServerIo) => {
  try {
    const profile = await currentProfilePages(req);
    if (!profile) {
      return res.status(401).json({ error: "Profile not found" });
    }

    const { channelId, serverId } = req?.query;
    const { content, fileUrl } = req.body;

    if (!serverId) return res.status(404).json({ error: "Server not found" });

    if (!channelId) return res.status(404).json({ error: "Channel not found" });

    if (!content)
      return res.status(404).json({ error: "content is required!" });

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
        },
      },
    });
    if (!server) return res.status(404).json({ error: "Server not found" });

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    const member = server.members.find(
      (member) => member.profileId === profile.id
    );
    if (!member) return res.status(404).json({ error: "Channel not found" });

    const message = await db.message.create({
      data: {
        content,
        fileUrl,
        memberId: member.id,
        channelId: channel.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${channelId}:message`;

    res?.socket?.server?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("error on message");
    console.log(error);
  }
  return null;
};

export default index;
