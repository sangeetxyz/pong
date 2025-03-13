import { memo } from "react";
import {
  EffectComposer,
  N8AO,
  TiltShift2,
  ToneMapping,
} from "@react-three/postprocessing";

const Effects = memo(() => (
  <EffectComposer enableNormalPass={false}>
    <N8AO aoRadius={0.5} intensity={2} />
    <TiltShift2 blur={0.2} />
    <ToneMapping />
  </EffectComposer>
));

Effects.displayName = "Effects";

export default Effects;
