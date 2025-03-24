import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ControlPanelProps {
  onShaverPositionChange: (position: { x: number; y: number; z: number }) => void;
  onShaverRotationChange: (rotation: { x: number; y: number; z: number }) => void;
  wireframeVisible: boolean;
  onWireframeToggle: (visible: boolean) => void;
  debugMode: boolean;
  onDebugModeToggle: (enabled: boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onShaverPositionChange,
  onShaverRotationChange,
  wireframeVisible,
  onWireframeToggle,
  debugMode,
  onDebugModeToggle,
}) => {
  const [shaverPosition, setShaverPosition] = useState({ x: 1.5, y: 0, z: 0 });
  const [shaverRotation, setShaverRotation] = useState({ x: 0, y: 0, z: 0 });

  const handlePositionChange = (axis: "x" | "y" | "z", value: number) => {
    const newPosition = { ...shaverPosition, [axis]: value };
    setShaverPosition(newPosition);
    onShaverPositionChange(newPosition);
  };

  const handleRotationChange = (axis: "x" | "y" | "z", value: number) => {
    const newRotation = { ...shaverRotation, [axis]: value };
    setShaverRotation(newRotation);
    onShaverRotationChange(newRotation);
  };

  return (
    <div className="control-panel w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Controls</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="wireframe-toggle"
              checked={wireframeVisible}
              onCheckedChange={onWireframeToggle}
            />
            <Label htmlFor="wireframe-toggle" className="text-sm">
              Show Wireframe
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="debug-toggle"
              checked={debugMode}
              onCheckedChange={onDebugModeToggle}
            />
            <Label htmlFor="debug-toggle" className="text-sm">
              Debug Mode
            </Label>
          </div>
        </div>
      </div>

      <Tabs defaultValue="position" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="position">Position</TabsTrigger>
          <TabsTrigger value="rotation">Rotation</TabsTrigger>
        </TabsList>

        <TabsContent value="position" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="x-position">X Position</Label>
                <span className="text-sm text-muted-foreground">
                  {shaverPosition.x.toFixed(2)}
                </span>
              </div>
              <Slider
                id="x-position"
                min={-3}
                max={3}
                step={0.01}
                value={[shaverPosition.x]}
                onValueChange={(value) => handlePositionChange("x", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="y-position">Y Position</Label>
                <span className="text-sm text-muted-foreground">
                  {shaverPosition.y.toFixed(2)}
                </span>
              </div>
              <Slider
                id="y-position"
                min={-3}
                max={3}
                step={0.01}
                value={[shaverPosition.y]}
                onValueChange={(value) => handlePositionChange("y", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="z-position">Z Position</Label>
                <span className="text-sm text-muted-foreground">
                  {shaverPosition.z.toFixed(2)}
                </span>
              </div>
              <Slider
                id="z-position"
                min={-3}
                max={3}
                step={0.01}
                value={[shaverPosition.z]}
                onValueChange={(value) => handlePositionChange("z", value[0])}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rotation" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="x-rotation">X Rotation</Label>
                <span className="text-sm text-muted-foreground">
                  {(shaverRotation.x * (180 / Math.PI)).toFixed(0)}°
                </span>
              </div>
              <Slider
                id="x-rotation"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={[shaverRotation.x]}
                onValueChange={(value) => handleRotationChange("x", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="y-rotation">Y Rotation</Label>
                <span className="text-sm text-muted-foreground">
                  {(shaverRotation.y * (180 / Math.PI)).toFixed(0)}°
                </span>
              </div>
              <Slider
                id="y-rotation"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={[shaverRotation.y]}
                onValueChange={(value) => handleRotationChange("y", value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="z-rotation">Z Rotation</Label>
                <span className="text-sm text-muted-foreground">
                  {(shaverRotation.z * (180 / Math.PI)).toFixed(0)}°
                </span>
              </div>
              <Slider
                id="z-rotation"
                min={-Math.PI}
                max={Math.PI}
                step={0.01}
                value={[shaverRotation.z]}
                onValueChange={(value) => handleRotationChange("z", value[0])}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ControlPanel;
