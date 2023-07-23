interface ImageProps {
	alt: string;
	className?: string;
	images?: SpotifyApi.ImageObject[];
}

export default function Image({ alt, className, images }: ImageProps) {
	return (
		<img
			src={
				images.reduce((largest, image) =>
					largest
						? image.width > largest.width
							? image
							: largest
						: image
				).url
			}
			srcSet={images
				.map((image) => `${image.url} ${image.width}w`)
				.join(', ')}
			alt={alt}
			className={className}
		/>
	);
}
