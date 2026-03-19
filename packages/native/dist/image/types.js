/** Sampling filter for resize operations. */
export var SamplingFilter;
(function (SamplingFilter) {
    /** Nearest-neighbor sampling (fast, low quality). */
    SamplingFilter[SamplingFilter["Nearest"] = 1] = "Nearest";
    /** Triangle filter (linear interpolation). */
    SamplingFilter[SamplingFilter["Triangle"] = 2] = "Triangle";
    /** Catmull-Rom filter with sharper edges. */
    SamplingFilter[SamplingFilter["CatmullRom"] = 3] = "CatmullRom";
    /** Gaussian filter for smoother results. */
    SamplingFilter[SamplingFilter["Gaussian"] = 4] = "Gaussian";
    /** Lanczos3 filter for high-quality downscaling. */
    SamplingFilter[SamplingFilter["Lanczos3"] = 5] = "Lanczos3";
})(SamplingFilter || (SamplingFilter = {}));
/** Output image format for encoding. */
export var ImageFormat;
(function (ImageFormat) {
    /** PNG (lossless, quality ignored). */
    ImageFormat[ImageFormat["PNG"] = 0] = "PNG";
    /** JPEG (lossy, quality 0-100). */
    ImageFormat[ImageFormat["JPEG"] = 1] = "JPEG";
    /** WebP (lossless, quality ignored). */
    ImageFormat[ImageFormat["WebP"] = 2] = "WebP";
    /** GIF (quality ignored). */
    ImageFormat[ImageFormat["GIF"] = 3] = "GIF";
})(ImageFormat || (ImageFormat = {}));
