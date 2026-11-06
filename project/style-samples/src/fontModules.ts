import type React from "react";
import * as F_ChakraPetch from "@remotion/google-fonts/ChakraPetch";
import * as F_ShareTechMono from "@remotion/google-fonts/ShareTechMono";
import * as F_GochiHand from "@remotion/google-fonts/GochiHand";
import * as F_PatrickHand from "@remotion/google-fonts/PatrickHand";
import * as F_DMMono from "@remotion/google-fonts/DMMono";
import * as F_Anton from "@remotion/google-fonts/Anton";
import * as F_SpecialElite from "@remotion/google-fonts/SpecialElite";
import * as F_SpaceMono from "@remotion/google-fonts/SpaceMono";
import * as F_SedgwickAveDisplay from "@remotion/google-fonts/SedgwickAveDisplay";
import * as F_PermanentMarker from "@remotion/google-fonts/PermanentMarker";
import * as F_EBGaramond from "@remotion/google-fonts/EBGaramond";
import * as F_BowlbyOne from "@remotion/google-fonts/BowlbyOne";
import * as F_Fredoka from "@remotion/google-fonts/Fredoka";
import * as F_IBMPlexSansCondensed from "@remotion/google-fonts/IBMPlexSansCondensed";
import * as F_IBMPlexSans from "@remotion/google-fonts/IBMPlexSans";
import * as F_IBMPlexMono from "@remotion/google-fonts/IBMPlexMono";
import * as F_Baloo2 from "@remotion/google-fonts/Baloo2";
import * as F_Bangers from "@remotion/google-fonts/Bangers";
import * as F_ComicNeue from "@remotion/google-fonts/ComicNeue";
import * as F_BarlowCondensed from "@remotion/google-fonts/BarlowCondensed";
import * as F_ArchivoBlack from "@remotion/google-fonts/ArchivoBlack";
import * as F_HankenGrotesk from "@remotion/google-fonts/HankenGrotesk";
import * as F_BebasNeue from "@remotion/google-fonts/BebasNeue";
import * as F_Jost from "@remotion/google-fonts/Jost";
import * as F_Fraunces from "@remotion/google-fonts/Fraunces";
import * as F_VT323 from "@remotion/google-fonts/VT323";
import * as F_Unbounded from "@remotion/google-fonts/Unbounded";
import * as F_SpaceGrotesk from "@remotion/google-fonts/SpaceGrotesk";
import * as F_PressStart2P from "@remotion/google-fonts/PressStart2P";
import * as F_PixelifySans from "@remotion/google-fonts/PixelifySans";
import * as F_ArchitectsDaughter from "@remotion/google-fonts/ArchitectsDaughter";
import * as F_BricolageGrotesque from "@remotion/google-fonts/BricolageGrotesque";
import * as F_PlayfairDisplay from "@remotion/google-fonts/PlayfairDisplay";
import * as F_Shrikhand from "@remotion/google-fonts/Shrikhand";
import * as F_DMSerifDisplay from "@remotion/google-fonts/DMSerifDisplay";
import * as F_PoiretOne from "@remotion/google-fonts/PoiretOne";
import * as F_Cinzel from "@remotion/google-fonts/Cinzel";
import * as F_ZenAntique from "@remotion/google-fonts/ZenAntique";
import * as F_ShipporiMincho from "@remotion/google-fonts/ShipporiMincho";
import * as F_Lora from "@remotion/google-fonts/Lora";
import * as F_OldStandardTT from "@remotion/google-fonts/OldStandardTT";
import * as F_LibreFranklin from "@remotion/google-fonts/LibreFranklin";
import * as F_JetBrainsMono from "@remotion/google-fonts/JetBrainsMono";
import * as F_RubikMonoOne from "@remotion/google-fonts/RubikMonoOne";
import * as F_TiltNeon from "@remotion/google-fonts/TiltNeon";
import * as F_Schoolbell from "@remotion/google-fonts/Schoolbell";
import * as F_Kalam from "@remotion/google-fonts/Kalam";
import * as F_BodoniModa from "@remotion/google-fonts/BodoniModa";
import * as F_Righteous from "@remotion/google-fonts/Righteous";
import * as F_Michroma from "@remotion/google-fonts/Michroma";
import * as F_IMFellEnglish from "@remotion/google-fonts/IMFellEnglish";
import * as F_Cormorant from "@remotion/google-fonts/Cormorant";
import * as F_Rye from "@remotion/google-fonts/Rye";
import * as F_BowlbyOneSC from "@remotion/google-fonts/BowlbyOneSC";
import * as F_DelaGothicOne from "@remotion/google-fonts/DelaGothicOne";
import * as F_ZenKakuGothicNew from "@remotion/google-fonts/ZenKakuGothicNew";
import * as F_SourceSerif4 from "@remotion/google-fonts/SourceSerif4";
import * as F_SourceSans3 from "@remotion/google-fonts/SourceSans3";
import * as F_Barlow from "@remotion/google-fonts/Barlow";
import * as F_Rajdhani from "@remotion/google-fonts/Rajdhani";
import * as F_Teko from "@remotion/google-fonts/Teko";
import * as F_InstrumentSerif from "@remotion/google-fonts/InstrumentSerif";
import * as F_Poppins from "@remotion/google-fonts/Poppins";

export const FONT_MODULES: Record<string, {loadFont: any; getInfo: any}> = {
  "Chakra Petch": F_ChakraPetch,
  "Share Tech Mono": F_ShareTechMono,
  "Gochi Hand": F_GochiHand,
  "Patrick Hand": F_PatrickHand,
  "DM Mono": F_DMMono,
  "Anton": F_Anton,
  "Special Elite": F_SpecialElite,
  "Space Mono": F_SpaceMono,
  "Sedgwick Ave Display": F_SedgwickAveDisplay,
  "Permanent Marker": F_PermanentMarker,
  "EB Garamond": F_EBGaramond,
  "Bowlby One": F_BowlbyOne,
  "Fredoka": F_Fredoka,
  "IBM Plex Sans Condensed": F_IBMPlexSansCondensed,
  "IBM Plex Sans": F_IBMPlexSans,
  "IBM Plex Mono": F_IBMPlexMono,
  "Baloo 2": F_Baloo2,
  "Bangers": F_Bangers,
  "Comic Neue": F_ComicNeue,
  "Barlow Condensed": F_BarlowCondensed,
  "Archivo Black": F_ArchivoBlack,
  "Hanken Grotesk": F_HankenGrotesk,
  "Bebas Neue": F_BebasNeue,
  "Jost": F_Jost,
  "Fraunces": F_Fraunces,
  "VT323": F_VT323,
  "Unbounded": F_Unbounded,
  "Space Grotesk": F_SpaceGrotesk,
  "Press Start 2P": F_PressStart2P,
  "Pixelify Sans": F_PixelifySans,
  "Architects Daughter": F_ArchitectsDaughter,
  "Bricolage Grotesque": F_BricolageGrotesque,
  "Playfair Display": F_PlayfairDisplay,
  "Shrikhand": F_Shrikhand,
  "DM Serif Display": F_DMSerifDisplay,
  "Poiret One": F_PoiretOne,
  "Cinzel": F_Cinzel,
  "Zen Antique": F_ZenAntique,
  "Shippori Mincho": F_ShipporiMincho,
  "Lora": F_Lora,
  "Old Standard TT": F_OldStandardTT,
  "Libre Franklin": F_LibreFranklin,
  "JetBrains Mono": F_JetBrainsMono,
  "Rubik Mono One": F_RubikMonoOne,
  "Tilt Neon": F_TiltNeon,
  "Schoolbell": F_Schoolbell,
  "Kalam": F_Kalam,
  "Bodoni Moda": F_BodoniModa,
  "Righteous": F_Righteous,
  "Michroma": F_Michroma,
  "IM Fell English": F_IMFellEnglish,
  "Cormorant": F_Cormorant,
  "Rye": F_Rye,
  "Bowlby One SC": F_BowlbyOneSC,
  "Dela Gothic One": F_DelaGothicOne,
  "Zen Kaku Gothic New": F_ZenKakuGothicNew,
  "Source Serif 4": F_SourceSerif4,
  "Source Sans 3": F_SourceSans3,
  "Barlow": F_Barlow,
  "Rajdhani": F_Rajdhani,
  "Teko": F_Teko,
  "Instrument Serif": F_InstrumentSerif,
  "Poppins": F_Poppins,
};
