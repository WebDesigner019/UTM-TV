import Image from "next/image";

export function CampusWatermark() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/assets/kampus-utm-bangkalan.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-[0.03]"
        priority
      />
      <div className="absolute inset-0 bg-[#f5f5f7]/85" />
      <Image
        src="/assets/utm-watermark-secondary.jpg"
        alt=""
        width={220}
        height={220}
        className="absolute bottom-8 right-8 hidden rounded opacity-[0.04] grayscale md:block"
      />
    </div>
  );
}