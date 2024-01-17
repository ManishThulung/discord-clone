import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import { getOrCreateConversation } from "@/lib/conversation";

interface ChannelIdPageProps {
  params: {
    serverId: string;
    memberId: string;
  };
}

const DirectMessagePage = async ({ params }: ChannelIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId: params?.serverId,
      profileId: profile?.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember?.id,
    params.memberId
  );

  if (!conversation) {
    return redirect(`/servers/${params?.serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profile.id === profile.id ? memberTwo : memberOne;

  return (
    <>
      <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
        <ChatHeader
          imageUrl={otherMember.profile.imageUrl}
          name={otherMember.profile.name}
          serverId={params.serverId}
          type="conversation"
        />

        <ChatMessages
          member={otherMember}
          name={otherMember.profile.name}
          chatId={conversation.id}
          type="conversation"
          apiUrl="/api/direct-messages"
          socketUrl="/api/socket/direct-messages"
          socketQuery={{
            conversationId: conversation.id,
          }}
          paramKey="conversationId"
          paramValue={conversation.id}
        />

        <ChatInput
          name={otherMember.profile.name}
          type="channel"
          apiUrl="/api/socket/direct-messages"
          query={{
            conversationId: conversation.id,
          }}
        />
      </div>
    </>
  );
};

export default DirectMessagePage;
