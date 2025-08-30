interface DroneStatusProps {
  model?: string;
  altitude?: string;
  flightTime?: string;
}

export default function DroneStatus({
  model = "Mavic 3 Pro",
  altitude = "32.5 m",
  flightTime = "00:25:45",
}: DroneStatusProps) {
  return (
    <div className="relative inline-block mb-4">
      <div className="bg-[#111111] rounded-[8px] px-6 py-2 w-[214px]">
        <h1 className="text-[16px] font-[700] mb-2 text-balance text-[#FFFFFF]">
          {model}
        </h1>

        <div className="grid grid-cols-2 gap-8">
          <div className="">
            <div className="text-[#CCCCCC] text-[12px] mb-2 font-[400]">
              Altitude
            </div>
            <div className="text-[14px] font-[400] text-[#FFFFFF]">
              {altitude}
            </div>
          </div>

          <div className="">
            <div className="text-[#CCCCCC] text-[12px] mb-2 font-[400]">
              Flight Time
            </div>
            <div className="text-[14px] font-[400] text-[#FFFFFF]">
              {flightTime}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2">
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#111111]"></div>
      </div>
    </div>
  );
}
