"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Database, Layers, ArrowRight } from "lucide-react";

const europeanCities = [
  { name: "Amsterdam", x: 452, y: 378, size: 12 },
  { name: "Berlin", x: 572, y: 376, size: 9 },
  { name: "Paris", x: 415, y: 431, size: 9 },
  { name: "London", x: 380, y: 391, size: 11 },
  { name: "Madrid", x: 329, y: 560, size: 9 },
  { name: "Milan", x: 512, y: 483, size: 11 },
];

const dataConnections = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 0, to: 3 },
  { from: 2, to: 5 },
];

const MAP_TRANSFORM = {
  translateX: -180,
  translateY: -220,
  scale: 0.85,
};

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Hero");
  const locale = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = [
    { label: t("yearsExperience"), value: "4+" },
    { label: t("marketsMapped"), value: "15+" },
    { label: t("geoProjects"), value: "10+" },
  ];

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden pt-20 md:pt-0">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1v38h38V1H1z' fill='%23888' fill-opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s", animationDelay: "2s" }} />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-primary/6 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-yellow-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "7s", animationDelay: "3s" }} />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(12)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${10 + (i * 7) % 80}%`,
              top: `${15 + (i * 11) % 70}%`,
              animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary to-transparent transform -rotate-12" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary to-transparent transform rotate-12" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary to-transparent transform -rotate-6" />
      </div>

      <div className="absolute top-20 left-8 w-32 h-32 border border-primary/10 rounded-lg transform rotate-12 opacity-30" />
      <div className="absolute bottom-20 left-16 w-24 h-24 border border-primary/5 rounded-full opacity-20" />

      {/* European Map Visualization */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] md:w-[60%] lg:w-[65%] h-[70%] md:h-[85%] opacity-20 md:opacity-35 lg:opacity-50 pointer-events-none">
        <svg viewBox="0 0 500 360" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
          </defs>

          <g transform={`translate(${MAP_TRANSFORM.translateX}, ${MAP_TRANSFORM.translateY}) scale(${MAP_TRANSFORM.scale})`}>
          {/* Merged Europe outline - single path eliminates border gaps/overlaps */}
          <g fill="currentColor" className="text-muted-foreground/15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3">
            <path d="M344.1,389.3L335.7,392.7L328.6,390.6L321.3,388.4L312.4,389.3L317.3,381.3L323.8,377.6L323.6,370.4L315.5,371.3L321.4,366.2L328.6,363.7L338,364.5L340.5,357.3L334.8,349.7L332.8,341.4L325.8,341.3L317.9,341.7L310.6,341.6L314,332.5L312.8,324.7L305.5,322.5L303.1,332.1L302.3,322L305.4,315L297.7,313.6L302.6,306L301.4,298.9L306.5,293.9L310.9,288.4L317.6,283.9L327.2,283.6L335.7,282.5L328.4,291.6L324.1,297.3L333.7,296.8L341.4,297.1L350.1,297.2L356.8,300.1L352.3,306L347.5,311.7L338.7,316L334.3,322.4L341.7,322.4L351.5,324.3L357.4,328.6L361.8,337.6L371.2,345L378.7,350.3L382.1,357.1L373.9,357.4L383.8,361.3L383.8,368.8L392,368.8L400.1,369.5L406.4,373.3L404.9,381.1L398.9,386.6L391.9,390.8L399.9,393.1L395.9,399.2L387.9,401.6L379.1,401.6L370.8,402.4L363.8,401L355.5,403.1L348.6,404.3L340.8,403L333.7,404.4L329.7,410.3L322.7,408L314.9,409.6L307.8,413.7L310.4,407.1L316.9,402.2L322.5,395.9L330.8,395.3L338.8,395L345.2,389.6L344.1,389.3ZM294,286.9L288.6,293.3L281.4,295.2L286.5,289.5L292.6,285L294,286.9ZM294.8,299.9L301,303.5L293,304.8L286.3,301.3L292.5,297.4L294.8,299.9ZM279.5,336.6L286.9,335.1L295,334.7L300.8,340.8L303.1,347.6L296.6,352.4L294.8,359.6L296.1,367L293.7,375.4L288.8,380.7L281.4,381.5L274.2,383.3L267.6,386.3L260.1,388.9L250,391.2L242.3,391.5L237,386.9L237,379.5L243.4,376.5L253.4,374.2L246.2,373.7L249.9,366.9L243.2,363.6L243.6,356.5L238.7,350.8L246.2,348.5L253.7,348.9L260.7,349.5L265.7,344.4L257.5,342.8L262.8,337.7L271.2,335L278.3,333.5L279.5,336.6ZM787.9,509.1L781.5,514.4L778,524.2L772.3,528.5L779.3,534.9L772.1,536.4L765,535.2L758.5,538.2L759.8,545.4L755.9,551.5L744.1,552.5L737.1,551.3L729.6,551.6L722,554.6L725.8,561L718.8,561.6L710,561.4L703.3,558.5L706.3,569L711.9,575.7L707.6,582L713.8,588.4L720.5,591.5L723.7,599.2L716.9,596.2L709.9,597.7L714.4,603.4L706.5,603.5L708.5,611.4L710.2,618.5L703.1,615L696.3,612.2L688.5,610.4L688.3,603.4L682.2,598.6L688,593.9L697.8,593.5L704.5,595.7L700.4,589.7L691.6,590.8L684.5,590.7L678.4,584.6L674.1,579L668.7,572.9L663.9,565.3L657.5,561.7L657.3,554L658.2,545.9L660,538.8L653.5,534.7L646.6,529.9L639.9,526L631.7,522.9L624,520.2L633.7,522.7L625.3,517.2L617.7,513.4L609.9,512.7L604.3,508.1L597.7,502.6L594.7,496L592.9,488.8L586.3,484.8L581.4,491.1L575.3,487.5L577.7,480.5L569.5,478.3L563.2,481.7L556.3,483.2L559.8,490.5L556.8,498.7L562.2,505.3L570.8,510L576.4,514.5L579.7,522.6L588.5,531.9L597.4,536.6L608.7,536.5L609.4,544.2L617,547.3L624.8,549.9L637,556.1L644.1,562.7L635.7,561.8L627,559.9L618.7,563.9L617.7,571.5L625,575.4L624.8,582.4L617.9,584.2L613.2,592.6L605.3,597.3L607.8,589L612.2,582.1L607.1,571.7L603.3,565.2L594.3,562.4L591.7,555.8L582.9,553.5L577,547.2L569.2,546.6L561.4,543.7L555.3,538.5L549.6,534.4L542.4,529.2L537.3,524.4L531.3,519.4L528.5,512.6L524.7,504.9L513.9,500.4L506.5,498.8L499.8,503.1L491.8,508.2L484,510.4L477.4,514.7L468.8,519.3L458.8,516.9L451.8,513.9L444.6,513.6L437.5,511.8L428.3,517.5L425.9,526.6L427.1,533.5L414.8,543.7L404.3,547.8L396.6,549.9L392.2,556.4L384.2,564.4L377.4,573.3L379.1,580.3L384.8,584.9L376.6,589.8L372.3,596.5L368.7,602.9L358.7,605.7L354.5,612.4L347.2,614.2L337.3,615.3L327.6,615.3L320,615.9L311.9,619.2L305.9,624.7L297.4,624L293.1,618.2L284.2,608.6L276.8,608.9L269.3,611.5L261.5,610.1L254.2,611.1L256.8,602.6L257,593.6L251.2,589.6L254.2,582.7L247.5,585.3L249.2,577.4L254.1,568.7L257.4,556.8L259,549.5L257,542.3L255.8,534L257,526.5L251.7,521.8L256,515.3L263.4,514.4L270.5,509.7L278.9,511.4L288,511.4L295.7,511.4L306.5,512L317.8,514.1L325,513.4L332,512.6L338.8,514.8L348.8,515.4L356.1,514.3L362.9,504.9L364.3,496.7L365.1,487.6L372.2,488.6L369.5,481.8L365.9,471.7L356.6,467L352.3,460.8L347.4,455.2L342.4,450.1L334.7,448.8L326.6,446.9L319.1,444.9L315,438.9L324.4,433.6L331.7,432.8L339.3,432.4L347.3,434.5L354.9,433.8L362.4,434.5L359.5,426.1L355.4,420.2L362.6,418.4L368.4,423.2L379.7,424.7L387.9,422.4L395.1,415.4L402,412.7L404.4,402.8L416.7,397.8L424,394.8L433,392.7L440.4,393.3L432.9,391.9L440.8,391.9L439.2,384.7L445.7,378.9L448.4,371.3L458.1,366.9L465.4,362.7L475.2,361.8L482.2,363.8L490.3,357.8L498,360.1L503.8,355.6L512.7,355.4L519.3,359.8L512.9,354.9L508.5,349.2L505.3,341.2L504.9,333L497.5,328.9L497.3,320.7L497.9,313.6L505.1,315.3L510.7,310.7L502.3,312.7L504.4,305.9L514,305.4L521.4,300.3L531.6,296.4L531.5,303.9L528.1,310.3L536,314.9L529.3,319L524.2,324.7L518.2,330.5L516.3,337.4L522.5,341.3L527,347L534.4,348.4L539.7,353.1L548.2,351.5L556.6,348.9L563.5,346.4L573,351.1L578.9,355.4L587.7,358.2L579.8,355L591,352.9L599.1,351.1L607.8,349.3L614.5,346.6L621.8,344.1L635.4,340.8L645.2,341.5L649.5,347.6L657.6,347.3L664.9,346.6L675.5,347L689.2,347.5L696.8,347.7L704.8,347.9L706.2,340.4L699.3,337L689.9,335.6L683.1,332.8L681.1,325.6L680.7,313.1L685.2,307.3L690.5,298.9L697.7,297.5L709.1,301.6L717.8,308L726.8,305L728,297.8L729.4,290.8L722.9,287.7L716.6,283.7L715.2,276.7L724,272.8L731.1,270.3L743.3,269.3L757.8,268.8L765,270.4L778.1,270.9L774.2,278L772.9,285.8L774.9,293.4L770.4,299.2L776.7,302.8L774.5,309.9L781.1,314.5L783.6,321.9L790.9,323.7L799.1,323.7L806.3,325.4L814.5,326L820.9,329.3L821.9,336.7L824.4,343.7L827.9,350.2L833.9,354.2L842.8,357.9L842.5,365.2L834.3,366.8L826.5,367.5L829.7,374L833,381.7L840.4,381.9L847.8,379.8L854.7,378.2L862.3,378.8L870.4,386.9L868.8,394.1L875.6,396.2L882.8,398.1L884.8,405.8L893.3,407.6L900.3,409.7L909.3,408.7L917.4,412.3L924.6,413.2L932.6,415.8L940.1,417.9L946.9,420.5L949.7,427.2L945.8,433.2L948.1,440L946.2,446.8L938.1,446.9L930.7,449.5L925.1,453.9L919.1,458.1L912.2,460.9L904.5,463.9L897.2,464.8L884.7,469L876.9,471.9L879,478.8L872.2,475.2L865.2,473.2L857.7,473.6L849.8,472.9L841.1,472.8L834,470.5L841.5,467.6L835.6,462.9L833,456.4L835,463.8L827.9,465.3L819.3,466.4L815.3,473.2L808.1,477.9L804.1,484.8L801.7,492.4L794.5,493.7L789.5,499.5L788,508.3L787.9,509.1ZM670.9,523L669.4,530.5L674.3,536.8L681,533L688.2,531.8L685.7,524.2L681,519L672.7,521.1L670.9,523ZM652.9,294.9L650.5,301.5L644.4,305.1L639.5,299.1L645.2,295L652.9,294.9ZM616.7,318.4L618.2,309.5L622.9,303.8L620.2,310.6L616.7,318.4ZM793.3,124.9L785.5,126.7L787.6,135.1L794.7,138.6L801.3,141.5L807.7,145.1L801.9,150.7L795,156L800.4,162.7L805.2,168.1L809.2,174L804.1,178.8L802.3,186L809,189.6L813.5,196.9L811,204.2L817.3,210.1L824.8,213.2L829.8,218.1L824.8,224.3L816,229.7L808.2,235.3L802,239.3L793.7,244.2L786.1,248L776.7,253.8L768.9,253.8L761.4,255.1L754.1,255.8L747.2,257.9L739.2,259L731.3,260.3L723.2,261.9L715.2,262.2L708.1,264.6L701,261.5L693.5,254.4L686.4,252.9L685.6,245.9L688.2,239.4L683.8,231.8L682.2,223.8L686.7,217.2L692.9,213.2L699.3,209.7L708.8,203.9L715.6,200.7L721.7,197L729,190.9L736.2,187.8L741.2,182.3L734.7,176L726.2,173.6L718.4,173.4L710.8,174.6L703.2,173.7L695.6,176.7L688.2,179.8L684.4,186.9L687.6,194.2L680.5,198.5L675.6,203.8L668.9,206.3L662.1,209.4L655.2,211.1L648.4,213.4L642,216.4L636.8,221.3L629.2,223.9L629.8,231.3L625.3,238.1L626.4,247L631.3,252.2L639.9,255.8L646.1,260.2L651.7,264.6L645.8,268.6L637.1,271.7L644.1,271.2L639,276.2L629.9,279.4L623.1,282.4L613.7,282.3L622.3,284.9L619.1,293.7L618.2,301.1L615.7,308.7L611.4,315.2L606.8,320.9L599.6,320.5L591.9,320.3L584.5,324.5L583.3,332L571.2,332.7L566.3,327.5L560.8,320.7L565.4,315L558.4,309L553.2,300.8L548.2,292.8L542.9,286.6L541.2,279.2L535.8,274.4L532.6,266.9L527.5,276.3L518.8,275.4L514.4,281L503,287.8L496.1,290.1L488,292.1L480,291.3L472.7,288.3L463.1,284.4L460.9,277.6L468.6,279.2L467.9,271.6L461,272.8L465.3,266L468.7,259.5L475.3,256.5L466.7,258.9L460.9,263.4L455.1,267.5L456.8,260.7L460.8,252.5L453.7,251.3L460.2,246L471.3,245.6L480,245.2L489.1,244.1L480.6,244.4L472.7,244.8L462.2,244.6L454.5,243.9L452.9,237L459.6,233.2L467.4,234.8L477.6,233.6L469.1,233.8L459.7,232.4L463.2,225.8L470.2,226.2L477,224.5L469.1,225.4L476,222.1L485.4,222.4L492.8,220.6L484.8,220.2L477.6,220.6L486.9,216.1L497,215L504.5,218.7L497.9,213.9L504.6,211.2L511.7,207.4L519.7,206.9L526.7,209.5L534,209.4L539.9,205.5L528.8,207.7L521.6,207L524.1,199.9L532,194.8L539.5,191.9L547.2,188.8L554.7,183.3L562.9,182.8L555.2,182.3L561.3,173.8L572.1,168L579.6,167.1L572.5,167L571,160.1L580.2,158.7L585.6,153.2L600.9,152.5L592.5,151.5L599.1,148.3L591.9,145.3L598.9,141L607.1,137.6L612.9,142.1L614.7,134.5L622.7,135L630.2,133.9L617.5,133.3L625.3,129.8L631.1,125.2L639.1,122.8L646.8,120.3L652.4,115.1L661.6,113L669.2,111.1L666.6,119.8L676.5,117.3L680.7,111.7L688.6,111L694.3,105.5L704.1,104.3L711.1,109.6L718,103.9L726.8,99.9L732.1,94.8L739.4,96.8L747.1,96.8L740.9,101.6L736.8,107.8L743.7,104.8L751,100.5L758.4,96.1L759.5,103.1L766.4,100.7L773.1,97.8L781.6,94.1L782.5,101.2L790.2,97.2L798.4,98.4L807.4,99.4L816.4,102L811.7,108.1L790.7,107.8L802.3,110.3L809.2,114.3L816.4,113.2L810.3,117.6L799.3,120.7L793.3,124.9ZM426.7,569.2L425.6,576.6L419.4,572.8L426.9,566.5L426.7,569.2ZM714.9,97.6L707.6,101.3L700.6,102.3L708.1,99.2L714.9,97.6ZM655.4,109L650.5,114.5L643.4,116.8L649.3,110.6L654.8,106.2L655.4,109ZM630.5,116.1L637.7,117.5L631.4,122.8L624.6,125L629,118.9L630.5,116.1ZM605.8,131.9L611.4,127.6L608.8,134.3L601.2,135.7L594,135.7L585.7,137.7L596.4,133.7L601.9,128.2L607.7,121L608.2,129.3L605.8,131.9ZM603.2,593L598.3,599.7L597.1,606.9L596.6,614.1L589.5,615.1L582.8,610L575,607.7L567.2,603.9L559.9,601.4L562.4,594.2L570.7,593.5L577.1,596.6L584.9,596.1L592,593.9L599,592.9L603.2,593ZM518.8,552.6L520.9,559.3L519.5,567.2L518.6,575.8L511.9,578.2L505.8,582.3L501.4,576.8L502.3,569.8L502.3,561.5L498.2,554.3L505.5,552.4L512.1,548L518.6,550.7L518.8,552.6ZM714.5,581.8L721.1,586L725.9,591.3L731,596.1L724.8,592.7L717.8,589.7L712.2,584.2L714.5,581.8ZM720.7,633.9L727.2,636.5L737.1,635.8L745.1,637L753.6,638.7L745.7,641.9L734.1,643L722.7,638.6L716.7,633.9L720.7,633.9ZM516.6,523.4L517.7,533.1L515.1,540.5L508.3,543L504.4,536.7L503.9,529.7L510.4,525.6L514.9,520.1L516.6,523.4ZM703.2,282.9L712.8,285.1L705.2,288.4L698.2,290L692.4,284.8L701.1,283.2L703.2,282.9ZM560.5,326.1L556.3,331.7L553.4,338.4L544.9,334.8L539.9,329.4L544.7,324.2L553,322L560.6,321.8L560.5,326.1ZM533.1,328.7L535.1,336L527.6,336.7L522,330.2L529,328.9L533.1,328.7Z" />
          </g>

          {mounted && dataConnections.map((conn, i) => {
            const from = europeanCities[conn.from];
            const to = europeanCities[conn.to];
            return (
              <line
                key={`conn-${i}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="#eab308" strokeWidth="2.5" strokeOpacity="0.4" strokeDasharray="10,10"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-40" dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
              </line>
            );
          })}

          {mounted && (
            <circle cx={europeanCities[0].x} cy={europeanCities[0].y} r="60" fill="url(#heatGradient)" className="animate-pulse" style={{ animationDuration: "3s" }} />
          )}

          {mounted && europeanCities.map((city, i) => (
            <g key={city.name}>
              {i === 0 && (
                <circle cx={city.x} cy={city.y} r={city.size + 10} fill="none" stroke="#eab308" strokeWidth="1.5" opacity="0.4" className="animate-ping" style={{ animationDuration: "2s" }} />
              )}
              <circle cx={city.x} cy={city.y} r={city.size} fill="#eab308" opacity={i === 0 ? "0.95" : "0.7"} filter={i < 2 ? "url(#glow)" : undefined} />
              <circle cx={city.x} cy={city.y} r={city.size * 0.35} fill="white" opacity="0.6" />
              <text x={city.x + city.size + 8} y={city.y + 5} className="fill-muted-foreground/70" fontSize="13" fontWeight="500">{city.name}</text>
            </g>
          ))}
          </g>
        </svg>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge variant="secondary" className="px-2 py-1 text-xs md:text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              {t("location")}
            </Badge>
            <Badge variant="outline" className="px-2 py-1 text-xs md:text-sm">
              {t("role")}
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 text-balance leading-tight">
            {t("title")}
            <span className="text-primary">{t("titleHighlight")}</span>
            {t("titleEnd")}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl leading-relaxed">
            {t("description")}
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8 md:mb-12">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href={`/${locale}/visualizations`}>
                {t("viewProjects")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto bg-transparent">
              <Link href={`/${locale}/contact`}>
                {t("getInTouch")}
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8 pt-6 md:pt-8 border-t border-border">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-6 md:mt-8">
            <span className="text-xs md:text-sm text-muted-foreground">{t("expertise")}</span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs md:text-sm">
                <Database className="w-3 h-3" />
                {t("dataEngineering")}
              </Badge>
              <Badge variant="secondary" className="gap-1 text-xs md:text-sm">
                <Layers className="w-3 h-3" />
                {t("machineLearning")}
              </Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">Python</Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">Airflow</Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">PostGIS</Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">Mapbox</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
