import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface SettingSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}
export default function SettingSlider(props: SettingSliderProps) {
  const {
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    unit = "",
  } = props;

  return (
    <div className="flex flex-row items-center justify-between">
      <Label className="w-60">
        {label}: {value}
        {unit}
      </Label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(value) => onChange(value[0])}
      />
    </div>
  );
}
