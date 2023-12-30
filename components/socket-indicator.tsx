"use client";

import { useSocket } from "./providers/socket-provider";
import { Badge } from "@/components/ui/badge";

const SocketIndicator = () => {
  const { isConnected } = useSocket();
  console.log(isConnected, "isConnected");

  // if (!isConnected) {
  //   return (
  //     <Badge variant="outline" className="bg-yellow-600 text-white border-none">
  //       Fallback: Polling every 1s
  //     </Badge>
  //   );
  // }

  return (
    <>
      {isConnected ? (
        <Badge
          variant="outline"
          className="bg-emerald-600 text-white border-none"
        >
          Live: Real-time updates
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-yellow-600 text-white border-none"
        >
          Fallback: Polling every 1s
        </Badge>
      )}
    </>
  );
};

export default SocketIndicator;
