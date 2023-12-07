import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <UserButton afterSignOutUrl="/" />
      <ModeToggle />
      <div className="text-4xl font-bold">this is protected route</div>
    </>
  );
}
