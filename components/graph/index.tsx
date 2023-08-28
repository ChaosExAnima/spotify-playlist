'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { getColorFromPercent } from '~/lib/color';

import classes from './styles.module.css';

import type { FeatureKeys, TrackInfo } from '~/lib/types';

interface GraphProps {
	className?: string;
	initial: FeatureKeys;
	tracks: TrackInfo[];
	validFeatures?: readonly FeatureKeys[];
}

const DEFAULT_FEATURES = [
	'acousticness',
	'danceability',
	'energy',
	'instrumentalness',
	'liveness',
	'tempo',
] as const;

type FeaturesMinMax = {
	[K in FeatureKeys]?: {
		max: number;
		min: number;
	};
};

export default function Graph({
	className = '',
	initial = 'danceability',
	tracks,
	validFeatures = DEFAULT_FEATURES,
}: GraphProps) {
	const [feature, setFeature] = useState<FeatureKeys>(initial);
	const minMaxMap = useMemo<FeaturesMinMax>(() => {
		return validFeatures
			.map((feature) => {
				return {
					[feature]: {
						max: Math.max(
							...tracks.map(
								(track) => track.features[feature] ?? 0
							)
						),
						min: Math.min(
							...tracks.map(
								(track) => track.features[feature] ?? 0
							)
						),
					},
				};
			})
			.reduce((acc, feature) => ({ ...acc, ...feature }), {});
	}, [tracks, validFeatures]);
	const clickHandler = (feat: FeatureKeys) => () => {
		if (validFeatures.includes(feat)) {
			setFeature(feat);
		}
	};
	return (
		<figure className={`${classes.container} ${className}`}>
			{tracks.map((track) => (
				<Bar
					feature={feature}
					key={track.id}
					map={minMaxMap}
					track={track}
				/>
			))}
			<figcaption>
				{validFeatures.map((feat) => (
					<span
						className={feat === feature ? 'active' : ''}
						key={feat}
						onClick={clickHandler(feat)}
					>
						{feat}
					</span>
				))}
			</figcaption>
		</figure>
	);
}

interface BarProps {
	feature: FeatureKeys;
	map: FeaturesMinMax;
	track: TrackInfo;
}

function Bar({ feature, map, track }: BarProps) {
	const ref = useRef<HTMLDivElement>();
	const value = track.features[feature];
	useEffect(() => {
		if (!ref.current) {
			return;
		}
		let percent = 0;
		if (value > 0 && value <= 1) {
			percent = value;
		} else {
			percent =
				(value - map[feature].min) /
				(map[feature].max - map[feature].min);
		}
		ref.current.style.height = `${percent * 100}%`;
		ref.current.style.setProperty(
			'--color-value',
			getColorFromPercent(percent)
		);
	}, [feature, map, value]);
	return <div className={classes.track} data-title={track.name} ref={ref} />;
}
