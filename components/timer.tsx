import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TimerIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Timer(params: { seconds : number, setTimerEnd:Dispatch<SetStateAction<Boolean>>, setTimerStart:Dispatch<SetStateAction<Boolean>> }) {
    const { seconds,setTimerEnd,setTimerStart } = params
  const [timeLeft, setTimeLeft] = useState(seconds); // Timer for 30 minutes (1800 seconds)


  useEffect(() => {
    const timer = setInterval(() => {
        if( timeLeft === 1 ){
            setTimerStart(true)
        }
        if( timeLeft === 0 ){
            setTimerEnd(true)
        }
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-sm mx-auto mt-10 text-center p-6 rounded-2xl shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-3xl font-semibold">
          <TimerIcon className="w-8 h-8" />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <p className="text-sm text-white/80 mt-4">
          After 30 minutes of inactivity, the room will be closed.
        </p>
      </CardContent>
    </Card>
  );
}
