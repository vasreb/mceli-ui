import type { MetricInfo } from './types';

export const APP_METRIC_INFO: MetricInfo[] = [
  {
    metric: 'strengthScore',
    title: 'strengthScore',
    how:
      'композит log1p(installsMid) + 0.7*log1p(reviewsCount) + 2.0*rating (пример).',
    what: 'одно число, чтобы сравнивать конкурентов.',
    interpret:
      'сильно выше остальных — ниша “захвачена”; много средне-сильных — распределённая конкуренция.',
  },
  {
    metric: 'installsMid',
    title: 'installsMid',
    how: 'обычно (installsMin + installsMax) / 2 (если ты так выбрал).',
    what: '“середина бакета” как удобная точка для сумм/рейтингов силы.',
    interpret: 'используешь для агрегатов по нише (sum/median), но помни — это приближение.',
  },
  {
    metric: 'reviewsCount',
    title: 'reviewsCount',
    how: 'из AppCardSnapshot.reviews.',
    what: 'число текстовых отзывов (обычно).',
    interpret: 'прокси “активности” и масштаба. Полезно для оценки силы конкурента в ASO.',
  },
  {
    metric: 'rating',
    title: 'rating',
    how: 'из AppCardSnapshot.score.',
    what: 'средняя оценка приложения (звёзды).',
    interpret:
      '4.4–4.8 часто “сильный продукт”, 4.0–4.3 — могут быть проблемы, ниже 4.0 — окно.',
  },
  {
    metric: 'hist_pain_score',
    title: 'hist_pain_score',
    how: 'из сбора гистограммы, отражает боль, где много негативных/двойных оценок.',
    what: 'индикатор проблемной/негативной реакции.',
    interpret: '>0.5 → стоит аккуратно анализировать баги и жалобы.',
  },
  {
    metric: 'hist_share_neg',
    title: 'hist_share_neg',
    how: '(h1+h2) / T.',
    what: 'общий негатив (1–2★).',
    interpret:
      'главный сигнал “болит ли продукт”. Для поиска ниш: высокий neg у крупных конкурентов = окно для входа.',
  },
  {
    metric: 'updateAgeDays',
    title: 'updateAgeDays',
    how: '(now - updatedAt) в днях.',
    what: 'сколько дней прошло с последнего обновления.',
    interpret:
      '0–60 дней: активная поддержка. 180–365+: часто заброшено (но зависит от жанра).',
  },
  {
    metric: 'hasIAP',
    title: 'hasIAP',
    how: 'из AppCardSnapshot.offersIAP.',
    what: 'есть ли встроенные покупки/подписка.',
    interpret: 'сигнал, что в нише реально берут деньги (особенно если у нескольких топов).',
  },
  {
    metric: 'iapRangeMax',
    title: 'iapRangeMax',
    how: 'парсинг из строки iapRange (“$49–$99”).',
    what: 'диапазон верхней ценовой границы.',
    interpret:
      'верхняя граница типа $49–$99 сигнал “высокой цены” (проф. фичи/пакеты).',
  },
  {
    metric: 'iapRangeMin',
    title: 'iapRangeMin',
    how: 'парсинг из строки iapRange.',
    what: 'минимальная граница IAP.',
    interpret: 'низкий минимум ($0.99) — легко конвертить много людей.',
  },
  {
    metric: 'iapRangeMid',
    title: 'iapRangeMid',
    how: 'часто (iapRangeMin + iapRangeMax) / 2 или цифры из метаданных магазина.',
    what: 'середина диапазона IAP — удобный прокси средней цены покупки внутри категорий.',
    interpret: 'высокий iapRangeMid указывает, что у конкурентов есть дорогие покупки; низкий — ниша ближе к недорогим/частым допам.',
  },
  {
    metric: 'iapPriceLevel',
    title: 'iapPriceLevel',
    how: 'if (iapRangeMin>0 && iapRangeMax>0) sqrt(iapRangeMin * iapRangeMax); else if (iapRangeMax>0) iapRangeMax; else if (iapRangeMin>0) iapRangeMin; else null.',
    what: 'оценка “уровня цен” IAP у приложения.',
    interpret: 'выше = в приложении есть дорогие покупки/подписки. Помогает различать “премиум” и “фри” конкурентов.',
  },
  {
    metric: 'iapMoneyScore',
    title: 'iapMoneyScore',
    how: 'iapPriceLevel == null ? 0 : ln(1 + iapPriceLevel).',
    what: 'лог-скор “денежности” IAP.',
    interpret: '0 = нет IAP/нет данных. Чем выше — тем выше средняя цена покупки (устойчив к выбросам).',
  },
  {
    metric: 'iapPriceSpread',
    title: 'iapPriceSpread',
    how: 'if(iapRangeMin>0 && iapRangeMax>0 && iapRangeMax>=iapRangeMin) ln(iapRangeMax / iapRangeMin) else null.',
    what: 'ширина ценового диапазона IAP.',
    interpret: 'большой spread = есть и дешёвые, и дорогие покупки (обычно подписка + пакеты).',
  },
  {
    metric: 'iapRevenuePotentialProxy',
    title: 'iapRevenuePotentialProxy',
    how: 'ln(1 + installsMid) * iapMoneyScore.',
    what: 'грубый прокси “потенциала IAP денег”.',
    interpret: 'подчёркивает сочетание масштаба (installs) и уровня цен; удобно сравнивать приложения разных ниш.',
  },
  {
    metric: 'hasAds',
    title: 'hasAds',
    how: 'из AppCardSnapshot.adSupported.',
    what: 'приложение поддерживается рекламой.',
    interpret:
      'hasAds=yes и hasIAP=yes → freemium. hasAds=no, hasIAP=yes → подписка/премиум.',
  },
  {
    metric: 'hist_neg_weighted_by_reviews',
    title: 'hist_neg_weighted_by_reviews',
    how: 'hist_share_neg * ln(1 + reviewsCount).',
    what: '“масштаб боли” с учетом размера аудитории.',
    interpret:
      'высокий = много людей и много недовольных → отличная нишевая возможность (если продукт популярный).',
  },
  {
    metric: 'hist_std',
    title: 'hist_std',
    how: 'sqrt(hist_variance).',
    what: 'то же, что variance, но в понятных единицах (корень).',
    interpret:
      'высокий std = сильная неоднородность опыта (разные устройства/баги/монетизация). Часто даёт идеи “починить стабильность”.',
  },
  {
    metric: 'hist_entropy',
    title: 'hist_entropy',
    how: '-Σ p_i ln(p_i) по p_i>0.',
    what: '“размазанность” распределения оценок.',
    interpret:
      'низкая энтропия = почти все ставят одно и то же (стабильно хорошо/плохо). Высокая = хаос/много разных мнений.',
  },
  {
    metric: 'hist_polar_extremes_share',
    title: 'hist_polar_extremes_share',
    how: '(h1+h5)/T.',
    what: 'доля крайностей (1★ + 5★).',
    interpret:
      'высокая = поляризация (люди либо кайфуют, либо ненавидят). Часто спорный UX/монетизация.',
  },
  {
    metric: 'hist_neg_to_pos_ratio',
    title: 'hist_neg_to_pos_ratio',
    how: '(h1+h2)/(h4+h5+eps).',
    what: 'насколько негатива много относительно позитива.',
    interpret:
      '>1 означает “негатива больше чем позитива” (очень плохо), 0.2–0.4 — уже заметная боль.',
  },
  {
    metric: 'hist_avg',
    title: 'hist_avg',
    how: '(1*h1+2*h2+3*h3+4*h4+5*h5)/T.',
    what: 'среднюю оценку по распределению.',
    interpret:
      'низкая = сильная проблема, но средняя может скрывать поляризацию (поэтому смотри std/entropy).',
  },
  {
    metric: 'hist_trimmed_avg_2_4',
    title: 'hist_trimmed_avg_2_4',
    how: '(2*h2+3*h3+4*h4)/(h2+h3+h4) если знаменатель > 0.',
    what: '“качество ядра” без крайностей 1★ и 5★.',
    interpret:
      'если hist_avg высокий, а trimmed низкий → распределение держится на крайностях (подозрительно/поляризовано).',
  },
  {
    metric: 'hist_neg_count_est',
    title: 'hist_neg_count_est',
    how: 'h1+h2.',
    what: 'абсолютное число негативных оценок.',
    interpret:
      'помогает отличить “10% негатива на 1M оценок” от “30% на 30 оценок”.',
  },
  {
    metric: 'ratingsCount',
    title: 'ratingsCount',
    how: 'из AppCardSnapshot.ratings.',
    what: 'количество выставленных оценок (без текста).',
    interpret: 'более “массовый” сигнал. Большое значение → много пользователей.',
  },
  {
    metric: 'installsMin',
    title: 'installsMin',
    how: 'берётся из AppCardSnapshot.minInstalls (нижняя граница “бакета”).',
    what: 'минимально возможное число установок по оценке сторa.',
    interpret: 'показатель масштаба. Хорошо для сравнения конкурентов внутри ниши.',
  },
  {
    metric: 'installsMax',
    title: 'installsMax',
    how: 'из AppCardSnapshot.maxInstalls (верхняя граница бакета).',
    what: 'максимальная граница установок в бакете.',
    interpret: 'вместе с installsMin показывает неопределённость. Большой размах → бакет широкий.',
  },
  {
    metric: 'updatedAt',
    title: 'updatedAt',
    how: 'из AppCardSnapshot.updated (последнее обновление).',
    what: 'насколько недавно продукт поддерживали.',
    interpret: 'свежие обновления → конкурент активен; старые → шанс “призрака”.',
  },
  {
    metric: 'iapRange',
    title: 'iapRange',
    how: 'строка вроде “$0.99 - $59.99 per item”.',
    what: 'диапазон цен на IAP.',
    interpret: 'верхний предел high, min low — много подходов.',
  },
  {
    metric: 'price',
    title: 'price',
    how: 'из AppCardSnapshot.price (0 если free).',
    what: 'цена покупки.',
    interpret: 'если цена > 0 и installs большие — ниша платёжная.',
  },
  {
    metric: 'isFree',
    title: 'isFree',
    how: 'из AppCardSnapshot.free.',
    what: 'бесплатно ли скачивание.',
    interpret: 'если “yes”, монетизация через рекламу/IAP/подписку.',
  },
  {
    metric: 'hist_total',
    title: 'hist_total',
    how: 'h1+h2+h3+h4+h5.',
    what: 'объём оценок в гистограмме (масштаб/доверие к распределению).',
    interpret: 'чем больше, тем стабильнее выводы по качеству. Малое значение → шум.',
  },
  {
    metric: 'hist_share_1',
    title: 'hist_share_1',
    how: 'h1 / T.',
    what: 'долю “жёсткого хейта” (1★).',
    interpret:
      'высокая доля = серьёзные проблемы / скандал / агрессивная монетизация / атака/накрутка (нужна ручная проверка).',
  },
  {
    metric: 'hist_share_2',
    title: 'hist_share_2',
    how: 'h2 / T.',
    what: 'долю сильного негатива (2★).',
    interpret:
      'вместе с 1★ показывает “боль”. Рост 2★ часто = “в целом работает, но бесит”.',
  },
  {
    metric: 'hist_share_3',
    title: 'hist_share_3',
    how: 'h3 / T.',
    what: 'долю нейтральных/середняк-оценок (3★).',
    interpret:
      'высокая доля = продукт “так себе”, много компромиссов, часто хорошая цель для улучшения UX.',
  },
  {
    metric: 'hist_share_4',
    title: 'hist_share_4',
    how: 'h4 / T.',
    what: 'долю довольных (4★).',
    interpret:
      'высокая доля 4★ при умеренных 5★ = “ровно хороший продукт” (конкурировать сложнее).',
  },
  {
    metric: 'hist_share_5',
    title: 'hist_share_5',
    how: 'h5 / T.',
    what: 'долю фанатов/максимально довольных (5★).',
    interpret:
      'очень высокая доля на большом объёме → либо реально топ, либо “просилки/накрутка” (проверить руками).',
  },
  {
    metric: 'hist_share_pos',
    title: 'hist_share_pos',
    how: '(h4+h5) / T.',
    what: 'общий позитив (4–5★).',
    interpret:
      'высокий pos = сильные конкуренты. Если pos высокий у всех топов — ниша может быть “закрыта качеством”.',
  },
  {
    metric: 'hist_share_mid',
    title: 'hist_share_mid',
    how: 'h3 / T.',
    what: '“сердцевина нейтралов” (3★).',
    interpret:
      'высокий mid = пользователи не в восторге, но терпят (можно выиграть простотой/полировкой).',
  },
  {
    metric: 'hist_polar_5_minus_1',
    title: 'hist_polar_5_minus_1',
    how: '(h5 - h1)/T.',
    what: 'перекос “любят vs ненавидят”.',
    interpret:
      'сильно положительное → скорее любят (или накрутка), сильно отрицательное → кризис/скандал/баги.',
  },
  {
    metric: 'hist_variance',
    title: 'hist_variance',
    how: 'Σ p_i*(i-mean)^2.',
    what: 'разброс оценок (нестабильность восприятия).',
    interpret:
      'выше = оценки сильно разъехались; полезно как “потенциальная поляризация/нестабильность”.',
  },
  {
    metric: 'anomalyScore2',
    title: 'anomalyScore2',
    how: 'из AppCardSnapshot.histAnomalyScore2.',
    what: 'второй вариант сигналов аномалий.',
    interpret: 'работает аналогично, но показывает другие особенности.',
  },
  {
    metric: 'anomalyScore',
    title: 'anomalyScore',
    how: 'из AppCardSnapshot.histAnomalyScore.',
    what: 'аномалия в активности шагов/отзывов.',
    interpret: 'высокий → возможно накрутка или резкие изменения.',
  },
];

