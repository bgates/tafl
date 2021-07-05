type ChoiceButtonProps = {
  type: string;
  choice: string;
  label: string;
  onChoice: (choice: string) => void;
};
export const ChoiceButton = ({
  type,
  choice,
  label,
  onChoice,
}: ChoiceButtonProps) => (
  <button className={`btn btn-${type}`} onClick={() => onChoice(choice)}>
    {label}
  </button>
);
