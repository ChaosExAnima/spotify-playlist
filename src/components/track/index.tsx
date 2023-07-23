import Image from '~/components/image';
import { TrackInfo } from '~/lib/types';

import classes from './styles.module.css';

interface TrackDisplayProps {
	track: TrackInfo;
}

export default function TrackDisplay({ track }: TrackDisplayProps) {
	const {
		album: { images, name: albumName },
		artists,
		features,
		name,
	} = track;
	return (
		<div className={classes.container}>
			<Image
				alt={`Cover of album ${albumName}`}
				className={classes.cover}
				images={images}
			/>
			<h1 className={classes.title}>{name}</h1>
			<h2 className={classes.artist}>
				By{' '}
				{artists.reduce(
					(str, artist) =>
						str.length ? `${str}, ${artist.name}` : artist.name,
					''
				)}
			</h2>
			<dl className={classes.features}>
				<TrackFeature features={features} name="danceability" />
				<TrackFeature features={features} name="energy" />
				<TrackFeature features={features} name="liveness" />
				<TrackFeature features={features} name="loudness" />
				<TrackFeature features={features} name="speechiness" />
				<TrackFeature
					features={features}
					max={180}
					min={70}
					name="tempo"
				/>
				<TrackFeature features={features} name="valence" />
			</dl>
		</div>
	);
}

type KeysOfValueType<O, T> = {
	[K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

interface TrackFeatureProps {
	features: SpotifyApi.AudioFeaturesObject;
	max?: number;
	min?: number;
	name: KeysOfValueType<SpotifyApi.AudioFeaturesObject, number>;
	precision?: number;
}

function TrackFeature({
	features,
	max,
	min,
	name,
	precision = 1,
}: TrackFeatureProps) {
	const feature = features[name];
	const rounding = Math.pow(10, precision);
	const percentage = feature > 0 && feature <= 1;
	const value = percentage
		? `${Math.round(feature * 100)}%`
		: Math.round(feature * rounding) / rounding;

	let hue = null;
	if (max && min) {
		hue = ((feature - min) / (max - min)) * 120;
	} else if (percentage) {
		hue = feature * 120;
	}
	return (
		<>
			<dt>{name}</dt>
			<dd style={hue && { color: `hsl(${hue},100%,50%)` }}>{value}</dd>
		</>
	);
}
