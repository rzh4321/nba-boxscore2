'use client'    // need this for useSchedule to work
import { VStack, Heading, HStack } from '@chakra-ui/react'
import { format, isToday } from 'date-fns'
import { useLeaders } from '../hooks/useLeaders'
import { PerformerCard } from '../components/PerformerCard'
import { BoxscoreResponse, Game } from '@/types';
import startCase from 'lodash/startCase'
import { useLastPlayedGameDate, getDateFromGameDate } from '@/hooks/useLastPlayedGameDate'

type SectionProps = {
  leaders: ReturnType<typeof useLeaders>['pointLeaders'];
  category: keyof BoxscoreResponse['game']['homeTeam']['players'][number]['statistics'];
}

// display a category and its leaders
const Section = ({ leaders, category } : SectionProps) => {
  return (
    <VStack w={'full'} align={'start'} spacing={4}>
      <Heading fontSize={'2xl'} color={'gray.400'} fontWeight={'normal'}>
        {/* startCase turns string into words starting with uppercase, like hello world to Hello World */}
        {startCase(category).split(' ')[0]}
      </Heading>
      <HStack
        w={'full'}
        spacing={8}
        overflowX={'scroll'}
        sx={{
          '::-webkit-scrollbar': {
            display: 'none'
          }
        }}
      >
        {/* display leaders for this category */}
        {leaders.map((leader) => (
          <PerformerCard
            key={`${leader.personId}-${category}`}
            player={leader}
            category={category}
          />
        ))}
      </HStack>
    </VStack>
  )
}


export const TopPerformers = () => {
  const lastPlayedGameDate = useLastPlayedGameDate()

  const games = lastPlayedGameDate?.games;
  // get gameIds of all games from last game date
  const gameIds = games?.filter((g : Game) => g.gameStatus > 1).map((g : Game) => g.gameId);
  // hasLiveGame is true of one of the games is still live
  const hasLiveGame = games?.some((g : Game) => g.gameStatus === 2)
  const { pointLeaders, assistLeaders, reboundLeaders } = useLeaders(
    gameIds || [],
    hasLiveGame     // if a game is live, this will refresh the box score data and re-render this component
                    // with updated leaders (a state change from custom hook re-renders components using it)
  )
    // cant find a last played game date for some reason
  if (!lastPlayedGameDate) {
    return null
  }

  const date = getDateFromGameDate(lastPlayedGameDate)

  return (
    <VStack w={'full'} align={'start'} px={4} py={8} spacing={12}>
      <Heading fontSize={'3xl'} fontWeight={'normal'} mb={-4}>
        {isToday(date)
          ? `Today's Top Performers`
          : `Top Performers for ${format(date, 'MMMM do')}`}
      </Heading>
      <Section leaders={pointLeaders} category={'points'} />
      <Section leaders={assistLeaders} category={'assists'} />
      <Section leaders={reboundLeaders} category={'reboundsTotal'} />
    </VStack>
  )
}