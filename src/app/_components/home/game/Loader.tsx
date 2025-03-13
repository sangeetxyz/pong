import { Html } from "@react-three/drei";
import { memo } from "react";
import MoonLoader from "react-spinners/MoonLoader";

const Loader = memo(() => {
  return (
    <Html center className="h-screen w-screen">
      <div className="flex h-full w-full items-center justify-center">
        <MoonLoader
          size={50}
          aria-label="Loading Spinner"
          data-testid="loader"
          color={"#fff"}
          loading={true}
        />
      </div>
    </Html>
  );
});

Loader.displayName = "Loader";

export default Loader;
