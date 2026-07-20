"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { getReturnWorkflowStep } from "@/lib/notifications";

const STEPS = ["review", "approve", "refund"] as const;

export default function NotificationReturnStepper({
  status,
}: {
  status?: string | null;
}) {
  const tn = useTranslations("Admin.Notifications");
  const currentStep = getReturnWorkflowStep(status);
  const isRejected = status === "return_rejected";

  return (
    <div className="border-t border-gray-200 pt-3">
      <p className="text-xs font-medium text-gray-600 mb-3">
        {tn("returnWorkflow")}
      </p>
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;
          const isFailed = isRejected && stepNumber === 3;

          return (
            <div key={step} className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isFailed
                    ? "bg-red-100 text-red-700"
                    : isComplete
                      ? "bg-green-100 text-green-700"
                      : isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-400"
                }`}
              >
                {isComplete ? <Check className="w-3.5 h-3.5" /> : stepNumber}
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-medium truncate ${
                    isActive ? "text-black" : "text-gray-500"
                  }`}
                >
                  {tn(`workflow.${step}`)}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`hidden sm:block h-px flex-1 ${
                    currentStep > stepNumber ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {isRejected && (
        <p className="text-xs text-red-600 mt-2">{tn("workflowRejected")}</p>
      )}
    </div>
  );
}
