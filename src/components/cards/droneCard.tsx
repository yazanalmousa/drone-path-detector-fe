import { cn } from "@/lib/utils";
import { isAllowedToFly } from "@/utils/getDroneStatus";

interface DroneCardProps {
  model: string;
  serial: string;
  registration: string;
  pilot: string;
  organization: string;
  status: "active" | "maintenance" | "idle";
  isActive?: boolean;
  onClick?: () => void;
}

const DroneCard = ({
  model,
  serial,
  registration,
  pilot,
  organization,
  status,
  isActive = false,
  onClick,
}: DroneCardProps) => {
  const getStatusColor = (reg: string) => {
    if (isAllowedToFly(reg)) {
      return "bg-green-500";
    } else {
      return "bg-red-500";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 border-b border-[#0B0B0B] cursor-pointer transition-colors",
        "hover:bg-[#272727]",
        isActive && "bg-[#272727]"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-[16px] font-[700] text-white mb-3">{model}</h2>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <p className="text-[#CCCCCC] font-[400] text-[11px]">
                  Serial #
                </p>
                <p className="text-[#CCCCCC] font-[700] text-[11px]">
                  {serial}
                </p>
              </div>

              <div>
                <p className="text-[#CCCCCC] font-[400] text-[11px]">
                  Registration #
                </p>
                <p className="text-[#CCCCCC] font-[700] text-[11px]">
                  {registration}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8">
              <div>
                <p className="text-[#CCCCCC] font-[400] text-[11px]">Pilot</p>
                <p className="text-[#CCCCCC] font-[700] text-[11px]">{pilot}</p>
              </div>

              <div>
                <p className="text-[#CCCCCC] font-[400] text-[11px]">
                  Organization
                </p>
                <p className="text-[#CCCCCC] font-[700] text-[11px]">
                  {organization}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div
            className={`w-4 h-4 rounded-full border-1 border-[#FFFFFF] ${getStatusColor(
              registration
            )}`}
          />
        </div>
      </div>
    </div>
  );
};

export default DroneCard;
