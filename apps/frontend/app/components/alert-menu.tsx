import { AlertDialog } from "@radix-ui/themes";
import React from "react";
import { MdDelete } from "react-icons/md";
import { nbBorder, nbButtonClass, nbShadowLg } from "./ui/neobrutal";

function AlertMenu({
  onConfirm,
  title = "Delete Link",
  description = "Are you sure? This link and all associated access will be permanently removed.",
  trigger,
  open,
  onOpenChange,
}: {
  onConfirm: () => void;
  title?: string;
  description?: string;
  trigger?: React.ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger !== null && (
        <AlertDialog.Trigger>
          {trigger ?? (
            <button className="p-1.5 rounded-md border-2 border-black bg-white hover:bg-red-100 transition-colors">
              <MdDelete color="#dc2626" size={16} />
            </button>
          )}
        </AlertDialog.Trigger>
      )}
      <AlertDialog.Content
        maxWidth="450px"
        className={`!bg-white !text-black !rounded-lg ${nbBorder} ${nbShadowLg}`}
      >
        <AlertDialog.Title className="!text-black !font-extrabold">{title}</AlertDialog.Title>
        <AlertDialog.Description size="2" className="!text-black/70 !font-medium">
          {description}
        </AlertDialog.Description>

        <div className="flex gap-3 mt-5 justify-end">
          <AlertDialog.Cancel>
            <button className={nbButtonClass({ color: "white", size: "sm" })}>Cancel</button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <button onClick={onConfirm} className={nbButtonClass({ color: "pink", size: "sm" })}>
              Delete
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}

export default React.memo(AlertMenu);
