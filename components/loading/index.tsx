import classes from './styles.module.css';

import type { ProgressHTMLAttributes } from 'react';

export default function LoadingComponent(
	props: ProgressHTMLAttributes<HTMLProgressElement>
) {
	return <progress {...props} className={classes.loader} />;
}
