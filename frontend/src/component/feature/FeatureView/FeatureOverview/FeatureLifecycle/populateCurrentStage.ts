import type { IFeatureToggle } from 'interfaces/featureToggle';
import type { LifecycleStage } from './LifecycleStage';

export const populateCurrentStage = (
    feature: Pick<IFeatureToggle, 'lifecycle' | 'environments'>,
): LifecycleStage | undefined => {
    if (!feature.lifecycle) return undefined;

    const getFilteredEnvironments = (condition: (type: string) => boolean) => {
        return feature.environments
            .filter((env) => condition(env.type) && Boolean(env.lastSeenAt))
            .map((env) => ({
                name: env.name,
                lastSeenAt: env.lastSeenAt!,
            }));
    };

    switch (feature.lifecycle.stage) {
        case 'initial':
            return { name: 'initial' };
        case 'pre-live':
            return {
                name: 'pre-live',
                environments: getFilteredEnvironments(
                    (type) => type !== 'production',
                ),
            };
        case 'live':
            return {
                name: 'live',
                environments: getFilteredEnvironments(
                    (type) => type === 'production',
                ),
            };
        case 'completed':
            return {
                name: 'completed',
                status: 'kept',
                environments: getFilteredEnvironments(
                    (type) => type === 'production',
                ),
            };
        case 'archived':
            return { name: 'archived' };
        default:
            return undefined;
    }
};
