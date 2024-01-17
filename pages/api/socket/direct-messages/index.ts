import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";

const index = async (req: NextApiRequest, res: NextApiResponseServerIo) => {
  try {
    const profile: any = await currentProfilePages(req);
    if (!profile) {
      return res.status(401).json({ error: "Profile not found" });
    }

    const { conversationId } = req?.query;
    const { content, fileUrl } = req.body;

    if (!conversationId)
      return res.status(404).json({ error: "Conversation not found" });

    if (!content)
      return res.status(404).json({ error: "content is required!" });

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            },
          },
          {
            memberTwo: {
              profileId: profile.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!conversation)
      return res.status(404).json({ error: "Conversation not found" });

    const member =
      conversation.memberOne.profileId === profile.id
        ? conversation.memberOne
        : conversation.memberTwo;

    const message = await db.directMessage.create({
      data: {
        content,
        fileUrl,
        memberId: member.id,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const channelKey = `chat:${conversationId}:messages`;

    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
    // return res.status(200).json("message");
  } catch (error) {
    console.log("error on direct message");
    console.log(error);
  }
  return null;
};

export default index;
