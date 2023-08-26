import Image from '~/components/image';
import { getColorFromPercent } from '~/lib/color';

import classes from './styles.module.css';

import type { FeatureKeys, TrackInfo } from '~/lib/types';

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

interface TrackFeatureProps {
	features: SpotifyApi.AudioFeaturesObject;
	max?: number;
	min?: number;
	name: FeatureKeys;
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
		hue = (feature - min) / (max - min);
	} else if (percentage) {
		hue = feature;
	}
	return (
		<>
			<dt>{name}</dt>
			<dd style={hue && { color: getColorFromPercent(feature) }}>
				{value}
			</dd>
		</>
	);
}
