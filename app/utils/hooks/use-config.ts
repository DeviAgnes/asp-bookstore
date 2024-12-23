import { useRootData } from '~/utils/hooks/use-root-data'

export function useConfig() {
  const { config } = useRootData()
  return config
}
