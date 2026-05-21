import Image from "next/image";

export function CampusWatermark() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Image
        src="/assets/kampus-utm-bangkalan.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-[0.045]"
        priority
      />
      <div className="absolute inset-0 bg-[#f7f9fb]/90" />
      <Image
        src="/assets/utm-watermark-secondary.jpg"
        alt=""
        width={220}
        height={220}
        className="absolute bottom-8 right-8 hidden rounded opacity-[0.055] grayscale md:block"
      />
    </div>
  );
}
