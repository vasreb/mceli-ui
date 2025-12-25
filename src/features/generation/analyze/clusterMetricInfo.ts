import type { MetricInfo } from './components/types';

export const CLUSTER_METRIC_INFO: MetricInfo[] = [
  // -------------------------
  // 0) Главные итоговые “куда копать”
  // -------------------------
  {
    metric: 'cluster_opportunity_iap_raw',
    title: 'cluster_opportunity_iap_raw',
    how:
      '(cluster_demand_score_raw ?? 0) * (cluster_gap_score_raw ?? 0) * cluster_money_factor_iap * (1 - clamp01(cluster_monopoly_penalty_raw ?? 0)).',
    what: 'opportunity, где денежность берётся из IAP-цен.',
    interpret:
      'высоко = спрос + боль + дорогие IAP у сильных root без монополии → ниша для заработка.',
  },
  {
    metric: 'cluster_opportunity_raw',
    title: 'Opportunity score (raw)',
    how: 'cluster_opportunity_raw = wavg(root_opportunity_raw, w_mix)',
    what: 'Итоговый raw-скор возможности: спрос × боль × деньги × (1 - монополия) (в агрегированном виде).',
    interpret: 'Чем выше, тем интереснее ниша для дальнейшего качественного анализа и выбора MVP.',
  },
  {
    metric: 'cluster_manual_priority_raw',
    title: 'Manual review priority (raw)',
    how: 'cluster_manual_priority_raw = wavg(root_manual_priority_raw, w_mix)',
    what: 'Приоритет ручной проверки: где быстрее всего найти ясное УТП по боли.',
    interpret: 'Сортируй по этому полю, чтобы понять, какие ниши смотреть глазами первыми.',
  },

  // -------------------------
  // 1) Спрос (масштаб ниши)
  // -------------------------
  {
    metric: 'cluster_demand_reviews_sum_robust',
    title: 'Reviews demand (robust p75)',
    how: 'cluster_demand_reviews_sum_robust = p75(root_demand_reviews_sum over R)',
    what: 'Робастная оценка спроса по отзывам (типичный сильный root).',
    interpret: 'Лучше отражает “среднюю силу” ниши, чем upper, и устойчивее, чем lower.',
  },
  {
    metric: 'cluster_demand_installs_sum_mid_robust',
    title: 'Installs demand (robust p75)',
    how: 'cluster_demand_installs_sum_mid_robust = p75(root_demand_installs_sum_mid over R)',
    what: 'Робастная оценка спроса по installs (типичный сильный root).',
    interpret:
      'Хороший компромисс: не зависит от одного супер-root и меньше раздувается, чем upper.',
  },
  {
    metric: 'cluster_demand_reviews_sum_lower',
    title: 'Reviews demand (lower bound)',
    how: 'cluster_demand_reviews_sum_lower = max(root_demand_reviews_sum over R)',
    what: 'Нижняя оценка спроса по отзывам (самый сильный root).',
    interpret:
      'Если lower высокий — ниша точно имеет активную аудиторию. Отлично для фильтра “не тратить время на мелочь”.',
  },
  {
    metric: 'cluster_demand_installs_sum_mid_lower',
    title: 'Installs demand (lower bound)',
    how: 'cluster_demand_installs_sum_mid_lower = max(root_demand_installs_sum_mid over R)',
    what: 'Нижняя оценка спроса: самый сильный root в кластере.',
    interpret:
      'Если даже lower высокий — ниша точно не маленькая. Если upper высокий, а lower низкий — кластер может быть расплывчатым/шумным.',
  },

  // -------------------------
  // 2) Окно входа: боль/качество
  // -------------------------
  {
    metric: 'cluster_app_pain_score_avg_weighted',
    title: 'Pain score (weighted)',
    how: 'cluster_app_pain_score_avg_weighted = wavg(root_app_pain_score_avg, w_mix)',
    what: 'Сила боли с учётом масштаба (негатив * ln(отзывы)).',
    interpret:
      'Высоко → боль не локальная, а на большом объёме пользователей. Это лучший сигнал для дальнейшего качественного анализа.',
  },
  {
    metric: 'cluster_hist_neg_share_weighted',
    title: 'Negative share (weighted)',
    how: 'cluster_hist_neg_share_weighted = wavg(root_hist_neg_share_weighted, w_mix)',
    what: 'Доля 1–2★ у конкурентов (взвешенная по силе root).',
    interpret:
      'Высоко → пользователи массово недовольны топовыми решениями. Это прямое “окно входа” через улучшение качества.',
  },
  {
    metric: 'cluster_variants_diversity_entropy_norm',
    title: 'Variants diversity entropy (weighted)',
    how:
      'Нормализованная энтропия распределения volume_i среди всех variants >0 по кластеру (взвешено по root weights) – H = -Σ p_i ln p_i / ln(n).',
    what: 'Показывает, насколько сильно разбросан спрос по variantes внутри кластера.',
    interpret:
      'Ближе к 0 — спрос концентрируется в 1-2 запросах (жёсткая ниша, может быть трудно найти долгий хвост); ближе к 1 — спрос распределён, есть шанс найти поднишевую идею с менее жёсткой конкуренцией.',
  },
  {
    metric: 'cluster_hist_polar_std_weighted',
    title: 'Polarization std (weighted)',
    how: 'cluster_hist_polar_std_weighted = wavg(root_hist_polar_std_weighted, w_mix)',
    what: 'Поляризация оценок (нестабильность качества/монетизации) в нише.',
    interpret:
      'Высоко → рынок конфликтный: часто это баги/реклама/подписка. Хорошо для “сделать нормально”, но может быть риск.',
  },

  // -------------------------
  // 3) Окно входа: конкуренция/захват
  // -------------------------
  {
    metric: 'cluster_top3_share_reviews_weighted',
    title: 'Top-3 dominance (weighted)',
    how: 'cluster_top3_share_reviews_weighted = wavg(root_top3_share_reviews, w_mix)',
    what: 'Доля отзывов у топ-3 конкурентов (прокси “насколько выдача закрыта”).',
    interpret:
      'Высоко → ниша захвачена. Средне/низко → больше шансов залезть органикой через ASO и качественный продукт.',
  },
  {
    metric: 'cluster_hhi_reviews_weighted',
    title: 'HHI concentration (weighted)',
    how: 'cluster_hhi_reviews_weighted = wavg(root_hhi_reviews, w_mix)',
    what: 'Индекс концентрации (монополизация) по выдачам root.',
    interpret: 'Ближе к 1 → почти монополия. Ниже → рынок более “ровный”, легче войти.',
  },
  {
    metric: 'cluster_top1_share_reviews_weighted',
    title: 'Top-1 dominance (weighted)',
    how: 'cluster_top1_share_reviews_weighted = wavg(root_top1_share_reviews, w_mix)',
    what: 'Насколько часто лидер забирает большую долю отзывов (прокси “захвата рынка”).',
    interpret:
      'Высоко → часто один монстр. Это повышает сложность входа, придётся искать узкую поднишу.',
  },
  {
    metric: 'cluster_top_strength_median_reviews_weighted',
    title: 'Competitor strength (median reviews)',
    how: 'cluster_top_strength_median_reviews_weighted = wavg(root_top_strength_median_reviews, w_mix)',
    what: 'Типичная сила конкурентов: сколько отзывов у медианного топового приложения.',
    interpret:
      'Очень высоко → придётся делать лучше/умнее и терпеливо. Умеренно → хорошая зона для соло-разраба.',
  },
  {
    metric: 'cluster_top_strength_p75_reviews_weighted',
    title: 'Competitor strength (p75 reviews)',
    how: 'cluster_top_strength_p75_reviews_weighted = wavg(root_top_strength_p75_reviews, w_mix)',
    what: 'Сила верхушки конкурентов (75 перцентиль).',
    interpret:
      'Если p75 огромный, но медиана умеренная — можно атаковать “второй эшелон” через поднишу/позиционирование.',
  },

  // -------------------------
  // 4) “Кладбище”: устаревшие решения
  // -------------------------
  {
    metric: 'cluster_ghost_share_weighted',
    title: 'Ghost share (weighted)',
    how: 'cluster_ghost_share_weighted = wavg(root_ghost_share, w_eff)',
    what: 'Доля “призраков” среди топовых результатов (взвешенная).',
    interpret:
      'Высоко → сильный сигнал “кладбища”: спрос есть, а качество/поддержка страдают. Отличный кандидат для соло.',
  },
  {
    metric: 'cluster_staleness_median_days_weighted',
    title: 'Staleness (median days)',
    how: 'cluster_staleness_median_days_weighted = wavg(root_staleness_median_days, w_mix)',
    what: 'Насколько “заброшены” топовые решения в нише (медиана дней с апдейта).',
    interpret:
      'Высоко → шанс зайти современным UX/стабильностью. Низко → конкуренты активны, нужно сильное отличие.',
  },
  {
    metric: 'cluster_staleness_p75_days_weighted',
    title: 'Staleness (p75 days)',
    how: 'cluster_staleness_p75_days_weighted = wavg(root_staleness_p75_days, w_mix)',
    what: 'Сколько дней с апдейта у “старой” части топа (75 перцентиль).',
    interpret:
      'Высокий p75 означает “есть кладбище” даже если медиана нормальная — хороший сигнал для стратегии “призраков”.',
  },

  // -------------------------
  // 5) Деньги: есть ли монетизация в нише
  // -------------------------
  {
    metric: 'cluster_iap_rate_weighted',
    title: 'IAP rate (weighted)',
    how: 'cluster_iap_rate_weighted = wavg(root_iap_rate, w_eff)',
    what: 'Доля приложений в топе, у которых есть IAP/подписка (прокси монетизации).',
    interpret:
      'Высоко → в нише принято платить. Низко → чаще рекламная ниша, где нужен больший объём трафика.',
  },
  {
    metric: 'cluster_iap_money_score_weighted',
    title: 'IAP money score (weighted)',
    how: 'cluster_iap_money_score_weighted = wavg(root_iap_money_score_weighted, w_mix)',
    what: 'Средняя “денежность” IAP по кластеру (взвешенная по силе root).',
    interpret:
      'Высоко = платёжеспособные users и дорогие допы у сильных root. Низко при высоком спросе = скорее ads/free.',
  },
  {
    metric: 'cluster_money_iap_score_raw',
    title: 'cluster_money_iap_score_raw',
    how: 'clamp01(cluster_iap_money_score_weighted / ln(1 + IAP_PRICE_CAP)).',
    what: 'нормализованный денежный скор IAP по кластеру.',
    interpret:
      'ближe к 1 = ниша стабильно имеет дорогие IAP. 0 = ниша скорее не про IAP деньги.',
  },
  {
    metric: 'cluster_iap_presence',
    title: 'cluster_iap_presence',
    how: 'pow(clamp01(cluster_iap_rate_weighted), IAP_RATE_EXP).',
    what: 'коэффициент “нормальности” IAP в нише.',
    interpret:
      'низко = IAP редкий; высоко = широко используется у конкурентов.',
  },
  {
    metric: 'cluster_money_iap_score_raw_gated',
    title: 'cluster_money_iap_score_raw_gated',
    how: 'cluster_money_iap_score_raw * cluster_iap_presence.',
    what: 'денежный скор, учитывающий распространённость IAP.',
    interpret:
      'если высоко — дорогие IAP есть у большинства лидеров, сигнал про настоящую “монетизацию”.',
  },
  {
    metric: 'cluster_money_factor_iap',
    title: 'cluster_money_factor_iap',
    how: 'moneyFloor + (1 - moneyFloor) * cluster_money_iap_score_raw_gated.',
    what: 'moneyFactor для cluster opportunity на основе IAP-цен.',
    interpret:
      'всегда ≥ moneyFloor; ближе к 1 = ниша выглядит платежеспособной.',
  },
  {
    metric: 'cluster_iap_price_level_p75_robust',
    title: 'IAP price level P75 (robust)',
    how: 'cluster_iap_price_level_p75_robust = median(root_iap_price_level_p75 over roots with data).',
    what: 'устойчивый индикатор дорогих IAP внутри ниши.',
    interpret:
      'Если высоко — это не единичный выброс, а повторяющийся дорогой чек на сильных root; помогает выбрать нишу с premium-скоростью.',
  },
  {
    metric: 'cluster_iap_price_level_median_weighted',
    title: 'IAP price level median (weighted)',
    how: 'cluster_iap_price_level_median_weighted = wmedian(root_iap_price_level_median, weight=root_effective_apps_count).',
    what: 'типичный чек IAP в нише, с весом на “полноту” root.',
    interpret:
      'Позволяет сравнивать кластеры с одинаковым спросом, но разной платежной культурой — сравнивай вместе с money score.',
  },
  {
    metric: 'cluster_root_iap_range_mid_avg',
    title: 'Root IAP range mid avg',
    how: 'cluster_root_iap_range_mid_avg = avg(iapRangeMid over R).',
    what: 'Средняя середина IAP-диапазона у root внутри кластера.',
    interpret:
      'Высокое значение говорит о том, что конкуренты продают дорогие внутриигровые покупки или подписки; низкое — ниша дешевле и может требовать массового ARPU.',
  },
  {
    metric: 'cluster_paid_rate_weighted',
    title: 'Paid apps rate (weighted)',
    how: 'cluster_paid_rate_weighted = wavg(root_paid_rate, w_eff)',
    what: 'Доля платных (не free) приложений в топе.',
    interpret:
      'Если платных много — сильный сигнал платежеспособности. Если почти нет — скорее freemium/ads.',
  },
  {
    metric: 'cluster_ads_rate_weighted',
    title: 'Ads rate (weighted)',
    how: 'cluster_ads_rate_weighted = wavg(root_ads_rate, w_eff)',
    what: 'Доля приложений с рекламой в топе.',
    interpret:
      'Высоко → возможно “адовая” ниша: шанс победить UX (“меньше рекламы”), но ARPU может быть ниже.',
  },
  {
    metric: 'cluster_money_score_raw',
    title: 'Money score (raw)',
    how: 'cluster_money_score_raw = wavg(root_money_score_raw, w_eff)',
    what: 'Raw-скор монетизации (насколько в нише принято платить).',
    interpret:
      'Больше → выше вероятность, что ниша монетизируется через IAP/подписку, а не только рекламу.',
  },

  // -------------------------
  // 6) Выбор точки входа (лучший root)
  // -------------------------
  {
    metric: 'cluster_best_root_manual_priority_raw',
    title: 'Best root manual priority',
    how: 'cluster_best_root_manual_priority_raw = max(root_manual_priority_raw over R)',
    what: 'Root, где “быстрее всего” вылезает понятная боль/УТП.',
    interpret:
      'Начинай ручной анализ с этого root: чаще всего там легче найти формулировку продукта.',
  },
  {
    metric: 'cluster_best_root_opportunity_raw',
    title: 'Best root opportunity',
    how: 'cluster_best_root_opportunity_raw = max(root_opportunity_raw over R)',
    what: 'Самый сильный запрос внутри кластера по “возможности”.',
    interpret:
      'Полезно, чтобы выбрать конкретный root для ручного анализа карточек/отзывов и формулировки MVP.',
  },
  {
    metric: 'cluster_best_root_demand_reviews_sum',
    title: 'Best root demand (reviews sum)',
    how: 'cluster_best_root_demand_reviews_sum = max(root_demand_reviews_sum over R)',
    what: 'Самый “массовый” root внутри кластера по сумме отзывов.',
    interpret:
      'Если best_root_demand высокий, а когезия тоже норм — ниша точно не пустая. Хорошая отправная точка для MVP.',
  },

  // -------------------------
  // 7) Качество кластера (важно, но вторично для чтения)
  // -------------------------
  {
    metric: 'cluster_cohesion_score',
    title: 'Cluster cohesion score',
    how: 'cluster_cohesion_score = cluster_sanity_overlap_weighted',
    what: 'Итоговый скор когезии (насколько это одна ниша).',
    interpret: 'Низко → сначала почистить кластер, иначе цифры будут врать. Высоко → можно верить агрегатам.',
  },
  {
    metric: 'cluster_sanity_overlap_weighted',
    title: 'Sanity overlap (weighted)',
    how:
      'cluster_sanity_overlap_weighted = wavg(sanityOverlap(r), w_mix(r)) where w_mix = eff * ln(1+reviewsSum)',
    what: 'Overlap, но с приоритетом сильных root.',
    interpret:
      'Это главный сигнал “одна ли ниша”. Если он низкий — кластер смешан, и выводы надо делать осторожно.',
  },

  // -------------------------
  // 8) Полезные, но менее “читаемые” поля (для дебага/аналитики)
  // -------------------------
  {
    metric: 'cluster_demand_score_raw',
    title: 'Demand score (raw)',
    how: 'cluster_demand_score_raw = wavg(root_demand_score_raw, w_mix)',
    what: 'Сводный raw-скор спроса, агрегированный по кластеру.',
    interpret:
      'Используй для сортировок/фильтров, но пользователю обычно понятнее installs/reviews робастные.',
  },
  {
    metric: 'cluster_gap_score_raw',
    title: 'Gap score (raw)',
    how: 'cluster_gap_score_raw = wavg(root_gap_score_raw, w_mix)',
    what: 'Raw-скор “дыры качества”.',
    interpret:
      'Полезен для ранжирования, но для UI лучше показывать pain/negShare и примеры root.',
  },
  {
    metric: 'cluster_monopoly_penalty_raw',
    title: 'Monopoly penalty (raw)',
    how: 'cluster_monopoly_penalty_raw = wavg(root_monopoly_penalty_raw, w_mix)',
    what: 'Штраф за захваченность выдачи лидерами.',
    interpret:
      'Удобно для сортировки, но в UI лучше показывать top3Share и HHI.',
  },
  {
    metric: 'cluster_sanity_overlap_avg',
    title: 'Sanity overlap (avg)',
    how: 'cluster_sanity_overlap_avg = avg(sanityOverlap(r) over R)',
    what: 'Средний overlap между root внутри кластера.',
    interpret: 'Более шумный показатель, чем weighted/median. Полезно как доп.ориентир.',
  },
  {
    metric: 'cluster_sanity_overlap_median',
    title: 'Sanity overlap (median)',
    how: 'cluster_sanity_overlap_median = median(sanityOverlap(r) over R)',
    what: 'Типичный overlap по кластеру.',
    interpret:
      'Хорошо видеть вместе с weighted: если median низкий, кластер “держится” на одном сильном root.',
  },
  {
    metric: 'cluster_sanity_overlap_p25',
    title: 'Sanity overlap (p25)',
    how: 'cluster_sanity_overlap_p25 = p25(sanityOverlap(r) over R)',
    what: 'Нижний квартиль overlap.',
    interpret: 'Очень низкий → много нерелевантных root, стоит чистить хвост.',
  },
  {
    metric: 'cluster_sanity_overlap_p75',
    title: 'Sanity overlap (p75)',
    how: 'cluster_sanity_overlap_p75 = p75(sanityOverlap(r) over R)',
    what: 'Верхний квартиль overlap.',
    interpret:
      'Высокий p75 при низком p25 → есть плотное ядро и шумный хвост.',
  },
  {
    metric: 'cluster_demand_reviews_sum_upper',
    title: 'Reviews demand (upper bound)',
    how: 'cluster_demand_reviews_sum_upper = sum(root_demand_reviews_sum over R)',
    what: 'Верхняя оценка спроса по отзывам (может завышаться из-за повторов).',
    interpret:
      'Полезно для внутренних сравнений и дебага, но для UI лучше robust/lower.',
  },
  {
    metric: 'cluster_demand_installs_sum_mid_upper',
    title: 'Installs demand (upper bound)',
    how: 'cluster_demand_installs_sum_mid_upper = sum(root_demand_installs_sum_mid over R)',
    what: 'Верхняя оценка спроса по installs (может завышаться).',
    interpret:
      'Как и reviews upper: больше для внутренних сравнений, чем для “человеческого” чтения.',
  },
  {
    metric: 'cluster_demand_reviews_median_weighted',
    title: 'Median reviews per app (weighted)',
    how: 'cluster_demand_reviews_median_weighted = wavg(root_demand_reviews_median, w_mix)',
    what: 'Типичная плотность отзывов в выдачах root.',
    interpret:
      'Скорее вторичный индикатор “живости” ниши; полезен для сравнения похожих ниш.',
  },
  {
    metric: 'cluster_demand_installs_median_mid_weighted',
    title: 'Median installs per app (weighted)',
    how: 'cluster_demand_installs_median_mid_weighted = wavg(root_demand_installs_median_mid, w_mix)',
    what: 'Типичная плотность installs в выдачах root.',
    interpret:
      'В паре с demand_sum помогает понять: ниша “один гигант” или “много средних”.',
  },
  {
    metric: 'cluster_ghost_count_sum',
    title: 'Ghost apps count (sum)',
    how: 'cluster_ghost_count_sum = sum(root_ghost_count over R)',
    what: 'Сколько раз встречаются “призраки” (может задваиваться).',
    interpret:
      'Более техническая метрика, для UI обычно достаточно ghost_share + staleness.',
  },
  {
    metric: 'cluster_stale_high_installs_count_sum',
    title: 'High-installs stale apps (sum)',
    how: 'cluster_stale_high_installs_count_sum = sum(root_stale_high_installs_count over R)',
    what: 'Сколько раз встречаются “сильные и старые” приложения (может задваиваться).',
    interpret:
      'Технический усилитель идеи “кладбища”. В UI можно показывать как “кол-во устаревших лидеров”.',
  },
  {
    metric: 'cluster_total_effective_apps_across_roots',
    title: 'Effective apps total (upper)',
    how: 'cluster_total_effective_apps_across_roots = sum(root_effective_apps_count over R)',
    what: 'Сколько данных собрано (без дедупа).',
    interpret:
      'В UI это скорее “качество/объём данных”, а не “рыночная” метрика.',
  },
  {
    metric: 'cluster_avg_effective_apps_per_root',
    title: 'Apps per root (avg)',
    how: 'cluster_avg_effective_apps_per_root = avg(root_effective_apps_count over R)',
    what: 'Средняя насыщенность выдач.',
    interpret:
      'В UI полезно как индикатор качества данных, но не ключевое для выбора ниши.',
  },
  {
    metric: 'cluster_missing_app_cards_sum',
    title: 'Missing app cards',
    how: 'cluster_missing_app_cards_sum = sum(root_missing_app_cards_count over R)',
    what: 'Сколько карточек не скачалось.',
    interpret: 'Скорее диагностика пайплайна. Пользователю можно показывать как “качество данных”.',
  },
  {
    metric: 'cluster_app_card_coverage_rate',
    title: 'App card coverage',
    how:
      'cluster_app_card_coverage_rate = sum(root_effective_apps_count) / sum(root_unique_apps_top_n) over R',
    what: 'Покрытие карточками.',
    interpret: 'Это метрика доверия к результатам. Низко → “цифры могут врать”.',
  },
  {
    metric: 'cluster_effective_roots_count',
    title: 'Effective roots',
    how: 'cluster_effective_roots_count = count(r in roots where root_effective_apps_count > 0)',
    what: 'Сколько root реально имеют данные.',
    interpret:
      'Скорее метрика качества данных: чем больше, тем надёжнее агрегаты.',
  },
  {
    metric: 'cluster_root_count',
    title: 'Roots in cluster',
    how: 'cluster_root_count = total count of roots in cluster (including empty)',
    what: 'Сколько root вообще.',
    interpret:
      'В UI можно показывать, но это вторично: главное — спрос/боль/конкуренция.',
  },
];

