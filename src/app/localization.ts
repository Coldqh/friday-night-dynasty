import { CareerEventType, ClassYear, DefenseStyle, MatchStage, OffenseStyle, Player, StateHeadlineType } from '../core/world/worldTypes';

export function formatClassYear(classYear: ClassYear) {
  switch (classYear) {
    case 'FR':
      return 'FR';
    case 'SO':
      return 'SO';
    case 'JR':
      return 'JR';
    case 'SR':
      return 'SR';
    default:
      return classYear;
  }
}

export function formatCareerStage(stage: Player['careerStage']) {
  switch (stage) {
    case 'graduated':
      return 'выпускник школы';
    case 'collegeProspect':
      return 'кандидат в колледж';
    case 'college':
      return 'игрок колледжа';
    case 'draftProspect':
      return 'кандидат на драфт';
    case 'pro':
      return 'профессиональный игрок';
    case 'retired':
      return 'завершил карьеру';
    default:
      return 'школьный игрок';
  }
}

export function formatPhase(phase: string) {
  switch (phase) {
    case 'regular':
      return 'регулярный сезон';
    case 'playoffs':
      return 'плей-офф';
    case 'offseason':
      return 'межсезонье';
    default:
      return phase;
  }
}

export function formatStage(stage: MatchStage | string) {
  switch (stage) {
    case 'regular':
    case 'Regular Season':
      return 'регулярка';
    case 'semifinal':
    case 'Semifinal':
      return 'полуфинал';
    case 'final':
    case 'State Final':
      return 'финал';
    default:
      return stage;
  }
}

export function formatScheduleStatus(status: string) {
  switch (status) {
    case 'Final':
      return 'сыграно';
    case 'Upcoming':
      return 'впереди';
    default:
      return status;
  }
}

export function formatOffenseStyle(style: OffenseStyle) {
  switch (style) {
    case 'balanced':
      return 'баланс';
    case 'runHeavy':
      return 'вынос';
    case 'passHeavy':
      return 'пас';
    case 'spread':
      return 'spread';
    case 'powerRun':
      return 'power';
    default:
      return style;
  }
}

export function formatDefenseStyle(style: DefenseStyle) {
  switch (style) {
    case 'balanced':
      return 'баланс';
    case 'aggressive':
      return 'агрессия';
    case 'conservative':
      return 'консервативно';
    case 'blitzHeavy':
      return 'blitz';
    default:
      return style;
  }
}

export function formatHeadlineType(type: StateHeadlineType) {
  switch (type) {
    case 'preview':
      return 'превью';
    case 'recap':
      return 'итоги';
    case 'upset':
      return 'апсет';
    case 'blowout':
      return 'разгром';
    case 'momentum':
      return 'форма';
    case 'pollPressure':
      return 'рейтинг';
    case 'playoff':
      return 'плей-офф';
    case 'playoffRace':
      return 'гонка за плей-офф';
    case 'undefeatedWatch':
      return 'без поражений';
    case 'mustWin':
      return 'матч на выживание';
    case 'lateSeason':
      return 'концовка сезона';
    case 'rivalry':
      return 'дерби';
    case 'champion':
      return 'чемпион';
    case 'offseason':
      return 'межсезонье';
    default:
      return 'новости';
  }
}

export function formatStakeLabel(label: string | null) {
  switch (label) {
    case 'State Final':
      return 'финал';
    case 'Playoff Semifinal':
      return 'полуфинал';
    case 'Rivalry with Playoff Pressure':
      return 'дерби';
    case 'Rivalry Game':
      return 'дерби';
    case 'Unbeaten Watch':
    case 'Undefeated Watch':
      return 'без поражений';
    case 'Playoff Race':
      return 'плей-офф';
    case 'Top-Four Showdown':
      return 'топ-4';
    case 'Evenly Matched Programs':
      return 'равные';
    case 'Late-season Must Win':
      return 'must win';
    default:
      return label ?? '';
  }
}

export function formatCareerEventType(type: CareerEventType) {
  switch (type) {
    case 'created':
      return 'старт';
    case 'freshmanArrival':
      return 'новичок';
    case 'development':
      return 'развитие';
    case 'graduation':
      return 'выпуск';
    case 'recruiting':
      return 'рекрутинг';
    case 'commitment':
      return 'коммит';
    case 'collegeArrival':
      return 'колледж';
    case 'collegeSeason':
      return 'сезон колледжа';
    case 'collegeGraduation':
      return 'выпуск колледжа';
    case 'draft':
      return 'драфт';
    case 'proDebut':
      return 'профи-дебют';
    case 'retirement':
      return 'завершение';
    case 'staffMove':
      return 'штаб';
    default:
      return 'событие';
  }
}
