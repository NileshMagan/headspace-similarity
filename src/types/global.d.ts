interface Window {
    cv: any;
    Module: {
      preRun: any[];
      postRun: any[];
      printErr: (text: string) => void;
      canvas: HTMLCanvasElement;
      setStatus: (text: string) => void;
      totalDependencies: number;
      monitorRunDependencies: (left: number) => void;
    };
  } 