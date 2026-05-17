import { CareerEventType, ClassYear, DefenseStyle, MatchStage, OffenseStyle, Phase, Player, StateHeadlineType } from '../core/world/worldTypes';

export function formatClassYear(classYear: ClassYear) {
  switch (classYear) {
    case 'FR':
      return '1 курс школы';
    case 'SO':
      return '2 курс школы';
    case 'JR':
      return '3 курс школы';
    case 'SR':
      return 'выпускник школы';
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

export function formatPhase(phase: Phase) {
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
      return 'регулярный сезон';
    case 'semifinal':
    case 'Semifinal':
      return 'полуфинал';
    case 'final':
    case 'State Final':
      return 'финал штата';
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
      return 'сбалансированное нападение';
    case 'runHeavy':
      return 'упор на вынос';
    case 'passHeavy':
      return 'упор на пас';
    case 'spread':
      return 'spread-нападение';
    case 'powerRun':
      return 'силовой вынос';
    default:
      return style;
  }
}

export function formatDefenseStyle(style: DefenseStyle) {
  switch (style) {
    case 'balanced':
      return 'сбалансированная защита';
    case 'aggressive':
      return 'агрессивная защита';
    case 'conservative':
      return 'осторожная защита';
    case 'blitzHeavy':
      return 'много блицев';
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
      return 'финал штата';
    case 'Playoff Semifinal':
      return 'полуфинал';
    case 'Rivalry with Playoff Pressure':
      return 'дерби с давлением плей-офф';
    case 'Rivalry Game':
      return 'дерби';
    case 'Unbeaten Watch':
    case 'Undefeated Watch':
      return 'серия без поражений';
    case 'Playoff Race':
      return 'гонка за плей-офф';
    case 'Top-Four Showdown':
      return 'матч топ-4';
    case 'Evenly Matched Programs':
      return 'равные команды';
    case 'Late-season Must Win':
      return 'матч на выживание';
    default:
      return label ?? '';
  }
}

export function formatCareerEventType(type: CareerEventType) {
  switch (type) {
    case 'created':
      return 'начало пути';
    case 'freshmanArrival':
      return 'приход новичка';
    case 'development':
      return 'развитие';
    case 'graduation':
      return 'выпуск';
    case 'recruiting':
      return 'рекрутинг';
    case 'commitment':
      return 'выбор программы';
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
