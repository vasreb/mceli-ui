import { makeAutoObservable, runInAction } from 'mobx';
import { api } from '@/api/client';
import type {
  AnalyzeOverviewDto,
  SerpSnapshotItem,
  SerpSnapshotListQueryDto,
  SerpSnapshotSortDto,
  AppSnapshotItem,
  AppSnapshotListQueryDto,
  RootSnapshotItem,
  RootSnapshotListQueryDto,
  ClusterMetricsListItem,
  ClusterMetricsListQueryDto,
  VariantListItem,
  VariantListQueryDto,
  ReviewListItem,
  ReviewListQueryDto,
} from '@/api/types';
import { APP_METRIC_FIELDS } from './appMetricsFields';
import { ROOT_METRIC_FIELDS } from './rootMetricsFields';
import { CLUSTER_METRIC_FIELDS } from './clusterMetricsFields';
import { SERP_METRIC_FIELDS } from './serpMetricsFields';

const convertToNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const calculateAverages = <MType>(
  items: Array<{ metrics: MType }>,
  getValue: (metrics: MType) => Record<string, unknown>
) => {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  items.forEach(({ metrics }) => {
    const values = getValue(metrics);
    Object.entries(values).forEach(([key, val]) => {
      const num = convertToNumber(val);
      if (num === null) {
        return;
      }
      sums[key] = (sums[key] ?? 0) + num;
      counts[key] = (counts[key] ?? 0) + 1;
    });
  });
  const averages: Record<string, number> = {};
  Object.keys(sums).forEach((key) => {
    const count = counts[key];
    if (count && count > 0) {
      averages[key] = sums[key] / count;
    }
  });
  return averages;
};

const APP_METRIC_ACCESSORS = Object.fromEntries(APP_METRIC_FIELDS);
const ROOT_METRIC_ACCESSORS = Object.fromEntries(ROOT_METRIC_FIELDS);
const SERP_METRIC_ACCESSORS = Object.fromEntries(
  SERP_METRIC_FIELDS.map(([metric, , accessor]) => [metric, accessor])
);

const CLUSTER_METRIC_KEYS = CLUSTER_METRIC_FIELDS.map(([metric]) => metric);

class AnalyzeStore {
  overview: AnalyzeOverviewDto | null = null;
  serpsList: SerpSnapshotItem[] = [];
  serpsListTotal = 0;
  serpsListPage = 1;
  serpsListPerPage = 10;
  serpsSortBy: SerpSnapshotSortDto | null = null;
  appSnapshotsList: AppSnapshotItem[] = [];
  appSnapshotsTotal = 0;
  appSnapshotsPage = 1;
  appSnapshotsPerPage = 10;
  appSnapshotsSortBy: SerpSnapshotSortDto | null = null;
  isLoadingAppSnapshots = false;
  appSnapshotsError: string | null = null;
  rootsList: RootSnapshotItem[] = [];
  rootsListTotal = 0;
  rootsListPage = 1;
  rootsListPerPage = 10;
  rootsListSortBy: SerpSnapshotSortDto | null = null;
  clustersList: ClusterMetricsListItem[] = [];
  clustersListTotal = 0;
  clustersListPage = 1;
  clustersListPerPage = 10;
  clustersListSortBy: SerpSnapshotSortDto | null = null;
  variantList: VariantListItem[] = [];
  variantListTotal = 0;
  variantListPage = 1;
  variantListPerPage = 10;
  variantListSortBy: SerpSnapshotSortDto | null = null;
  reviewList: ReviewListItem[] = [];
  reviewListTotal = 0;
  reviewListPage = 1;
  reviewListPerPage = 10;
  reviewListSortBy: SerpSnapshotSortDto | null = null;
  selectedAppIds: string[] = [];
  selectedClusterIds: string[] = [];
  selectedRootIds: string[] = [];
  isLoadingRootsList = false;
  rootsListError: string | null = null;
  isLoadingClustersList = false;
  clustersListError: string | null = null;
  isLoadingVariantList = false;
  variantListError: string | null = null;
  isLoadingReviewList = false;
  reviewListError: string | null = null;
  isLoadingOverview = false;
  isLoadingSerpsList = false;
  overviewError: string | null = null;
  serpsListError: string | null = null;
  isAnalyzing = false;
  analyzeError: string | null = null;

  private serpsListParams: SerpSnapshotListQueryDto = {
    page: 1,
    perPage: 10,
    search: '',
  };
  private appSnapshotsParams: AppSnapshotListQueryDto = {
    page: 1,
    perPage: 10,
    search: '',
  };
  private rootsListParams: RootSnapshotListQueryDto = {
    page: 1,
    perPage: 10,
    search: '',
  };
  private clustersListParams: ClusterMetricsListQueryDto = {
    page: 1,
    perPage: 10,
    search: '',
  };
  private variantListParams: VariantListQueryDto = {
    page: 1,
    perPage: 10,
    search: '',
  };
  private reviewListParams: ReviewListQueryDto = {
    page: 1,
    perPage: 10,
    search: '',
  };

  constructor() {
    makeAutoObservable(this);
  }

  loadOverview = async (id: string) => {
    runInAction(() => {
      this.isLoadingOverview = true;
      this.overviewError = null;
    });
    try {
      const data = await api.getAnalyzeOverview(id);
      runInAction(() => {
        this.overview = data;
      });
    } catch (error) {
      runInAction(() => {
        this.overviewError = error instanceof Error ? error.message : 'Ошибка загрузки анализа';
      });
    } finally {
      runInAction(() => {
        this.isLoadingOverview = false;
      });
    }
  };

  loadSerps = async (id: string, params?: SerpSnapshotListQueryDto) => {
    const page = params?.page ?? this.serpsListParams.page ?? 1;
    const perPage = params?.perPage ?? this.serpsListParams.perPage ?? 10;
    const search = params?.search ?? this.serpsListParams.search ?? '';
    const sortBy = params?.sortBy ?? this.serpsSortBy ?? undefined;

    const query: SerpSnapshotListQueryDto = {
      page,
      perPage,
    };
    if (search) {
      query.search = search;
    }
    if (sortBy) {
      query.sortBy = sortBy;
    }

    runInAction(() => {
      this.isLoadingSerpsList = true;
      this.serpsListError = null;
      this.serpsListParams = { page, perPage, search };
      this.serpsSortBy = sortBy ?? null;
    });

    try {
      const response = await api.getAnalyzeSerps(id, query);
      runInAction(() => {
        this.serpsList = response.items;
        this.serpsListTotal = response.total;
        this.serpsListPage = response.page;
        this.serpsListPerPage = response.perPage;
      });
    } catch (error) {
      runInAction(() => {
        this.serpsListError = error instanceof Error ? error.message : 'Ошибка загрузки SERP';
      });
    } finally {
      runInAction(() => {
        this.isLoadingSerpsList = false;
      });
    }
  };

  triggerAnalyze = async (id: string) => {
    runInAction(() => {
      this.isAnalyzing = true;
      this.analyzeError = null;
    });
    try {
      await api.triggerAnalyze(id);
      await Promise.all([
        this.loadOverview(id),
        this.loadSerps(id),
        this.loadAppSnapshots(id),
        this.loadRoots(id),
        this.loadClusters(id),
        this.loadVariants(id),
        this.loadReviews(id),
      ]);
    } catch (error) {
      runInAction(() => {
        this.analyzeError = error instanceof Error ? error.message : 'Ошибка запуска анализа';
      });
    } finally {
      runInAction(() => {
        this.isAnalyzing = false;
      });
    }
  };

  reset = () => {
    this.overview = null;
    this.serpsList = [];
    this.serpsListTotal = 0;
    this.serpsListPage = 1;
    this.serpsListPerPage = 10;
    this.appSnapshotsList = [];
    this.appSnapshotsTotal = 0;
    this.appSnapshotsPage = 1;
    this.appSnapshotsPerPage = 10;
    this.rootsList = [];
    this.rootsListTotal = 0;
    this.rootsListPage = 1;
    this.rootsListPerPage = 10;
    this.clustersList = [];
    this.clustersListTotal = 0;
    this.clustersListPage = 1;
    this.clustersListPerPage = 10;
    this.variantList = [];
    this.variantListTotal = 0;
    this.variantListPage = 1;
    this.variantListPerPage = 10;
    this.reviewList = [];
    this.reviewListTotal = 0;
    this.reviewListPage = 1;
    this.reviewListPerPage = 10;
    this.selectedAppIds = [];
    this.overviewError = null;
    this.serpsListError = null;
    this.appSnapshotsError = null;
    this.rootsListError = null;
    this.clustersListError = null;
    this.variantListError = null;
    this.reviewListError = null;
    this.isLoadingOverview = false;
    this.isLoadingSerpsList = false;
    this.isLoadingAppSnapshots = false;
    this.isLoadingRootsList = false;
    this.isLoadingClustersList = false;
    this.isLoadingVariantList = false;
    this.isLoadingReviewList = false;
    this.isAnalyzing = false;
    this.analyzeError = null;
    this.serpsListParams = {
      page: 1,
      perPage: 10,
      search: '',
    };
    this.appSnapshotsParams = {
      page: 1,
      perPage: 10,
      search: '',
    };
    this.rootsListParams = {
      page: 1,
      perPage: 10,
      search: '',
    };
    this.clustersListParams = {
      page: 1,
      perPage: 10,
      search: '',
    };
    this.variantListParams = {
      page: 1,
      perPage: 10,
      search: '',
    };
    this.reviewListParams = {
      page: 1,
      perPage: 10,
      search: '',
    };
    this.serpsSortBy = null;
    this.appSnapshotsSortBy = null;
    this.rootsListSortBy = null;
    this.clustersListSortBy = null;
    this.reviewListSortBy = null;
  };

  setSelectedAppIds(ids: string[]) {
    this.selectedAppIds = ids;
  }

  clearSelectedAppIds() {
    this.selectedAppIds = [];
  }

  setSelectedRootIds(ids: string[]) {
    this.selectedRootIds = ids;
  }

  clearSelectedRootIds() {
    this.selectedRootIds = [];
  }

  loadAppSnapshots = async (id: string, params?: AppSnapshotListQueryDto) => {
    const page = params?.page ?? this.appSnapshotsParams.page ?? 1;
    const perPage = params?.perPage ?? this.appSnapshotsParams.perPage ?? 10;
    const search = params?.search ?? this.appSnapshotsParams.search ?? '';
    const sortBy = params?.sortBy ?? this.appSnapshotsSortBy ?? undefined;
    const rootId = params?.filter?.rootId?.trim() ?? undefined;
    const clusterId = params?.filter?.clusterId?.trim() ?? undefined;

    console.log(rootId);

    const query: AppSnapshotListQueryDto = {
      page,
      perPage,
    };
    if (search) {
      query.search = search;
    }
    if (rootId || clusterId) {
      query.filter = {};
      if (rootId) {
        query.filter.rootId = rootId;
      }
      if (clusterId) {
        query.filter.clusterId = clusterId;
      }
    }
    if (sortBy) {
      query.sortBy = sortBy;
    }

    runInAction(() => {
      this.isLoadingAppSnapshots = true;
      this.appSnapshotsError = null;
      this.appSnapshotsParams = {
        page,
        perPage,
        search,
        filter:
          rootId || clusterId
            ? {
                ...(rootId ? { rootId } : {}),
                ...(clusterId ? { clusterId } : {}),
              }
            : undefined,
      };
      this.appSnapshotsSortBy = sortBy ?? null;
    });

    try {
      const response = await api.getAnalyzeAppSnapshots(id, query);
      runInAction(() => {
        this.appSnapshotsList = response.items;
        this.appSnapshotsTotal = response.total;
        this.appSnapshotsPage = response.page;
        this.appSnapshotsPerPage = response.perPage;
      });
    } catch (error) {
      runInAction(() => {
        this.appSnapshotsError =
          error instanceof Error ? error.message : 'Ошибка загрузки app snapshots';
      });
    } finally {
      runInAction(() => {
        this.isLoadingAppSnapshots = false;
      });
    }
  };

  loadRoots = async (id: string, params?: RootSnapshotListQueryDto) => {
    const page = params?.page ?? this.rootsListParams.page ?? 1;
    const perPage = params?.perPage ?? this.rootsListParams.perPage ?? 10;
    const search = params?.search ?? this.rootsListParams.search ?? '';
    const sortBy = params?.sortBy ?? this.rootsListSortBy ?? undefined;
    const filter = params?.filter ?? this.rootsListParams.filter;

    const query: RootSnapshotListQueryDto = {
      page,
      perPage,
    };
    if (search) {
      query.search = search;
    }
    if (filter) {
      query.filter = filter;
    }
    if (sortBy) {
      query.sortBy = sortBy;
    }

    runInAction(() => {
      this.isLoadingRootsList = true;
      this.rootsListError = null;
      this.rootsListParams = { page, perPage, search, filter };
      this.rootsListSortBy = sortBy ?? null;
    });

    try {
      const response = await api.getAnalyzeRoots(id, query);
      runInAction(() => {
        this.rootsList = response.items;
        this.rootsListTotal = response.total;
        this.rootsListPage = response.page;
        this.rootsListPerPage = response.perPage;
      });
    } catch (error) {
      runInAction(() => {
        this.rootsListError =
          error instanceof Error ? error.message : 'Ошибка загрузки roots';
      });
    } finally {
      runInAction(() => {
        this.isLoadingRootsList = false;
      });
    }
  };

  loadVariants = async (id: string, params?: VariantListQueryDto) => {
    const page = params?.page ?? this.variantListParams.page ?? 1;
    const perPage = params?.perPage ?? this.variantListParams.perPage ?? 10;
    const search = params?.search ?? this.variantListParams.search ?? '';
    const sortBy = params?.sortBy ?? this.variantListSortBy ?? undefined;
    const filter = params?.filter ?? this.variantListParams.filter;

    const query: VariantListQueryDto = {
      page,
      perPage,
    };
    if (search) {
      query.search = search;
    }
    if (sortBy) {
      query.sortBy = sortBy;
    }
    if (filter) {
      query.filter = filter;
    }

    runInAction(() => {
      this.isLoadingVariantList = true;
      this.variantListError = null;
      this.variantListParams = { page, perPage, search, filter };
      this.variantListSortBy = sortBy ?? null;
    });

    try {
      const response = await api.getAnalyzeVariants(id, query);
      runInAction(() => {
        this.variantList = response.items;
        this.variantListTotal = response.total;
        this.variantListPage = response.page;
        this.variantListPerPage = response.perPage;
      });
    } catch (error) {
      runInAction(() => {
        this.variantListError =
          error instanceof Error ? error.message : 'Ошибка загрузки variants';
      });
    } finally {
      runInAction(() => {
        this.isLoadingVariantList = false;
      });
    }
  };


  loadReviews = async (id: string, params?: ReviewListQueryDto) => {
    const page = params?.page ?? this.reviewListParams.page ?? 1;
    const perPage = params?.perPage ?? this.reviewListParams.perPage ?? 10;
    const search = params?.search ?? this.reviewListParams.search ?? '';
    const sortBy = params?.sortBy ?? this.reviewListSortBy ?? undefined;
    const filter = params?.filter ?? this.reviewListParams.filter;

    const query: ReviewListQueryDto = {
      page,
      perPage,
    };
    if (search) {
      query.search = search;
    }
    if (sortBy) {
      query.sortBy = sortBy;
    }
    if (filter) {
      query.filter = filter;
    }

    runInAction(() => {
      this.isLoadingReviewList = true;
      this.reviewListError = null;
      this.reviewListParams = { page, perPage, search, filter };
      this.reviewListSortBy = sortBy ?? null;
    });
    console.log(query)
    try {
      const response = await api.getAnalyzeReviews(id, query);
      runInAction(() => {
        this.reviewList = response.items;
        this.reviewListTotal = response.total;
        this.reviewListPage = response.page;
        this.reviewListPerPage = response.perPage;
      });
    } catch (error) {
      runInAction(() => {
        this.reviewListError =
          error instanceof Error ? error.message : 'Ошибка загрузки reviews';
      });
    } finally {
      runInAction(() => {
        this.isLoadingReviewList = false;
      });
    }
  };

  setSelectedClusterIds(ids: string[]) {
    this.selectedClusterIds = ids;
  }

  clearSelectedClusterIds() {
    this.selectedClusterIds = [];
  }

  loadClusters = async (id: string, params?: ClusterMetricsListQueryDto) => {
    const page = params?.page ?? this.clustersListParams.page ?? 1;
    const perPage = params?.perPage ?? this.clustersListParams.perPage ?? 10;
    const search = params?.search ?? this.clustersListParams.search ?? '';
    const sortBy = params?.sortBy ?? this.clustersListSortBy ?? undefined;

    const query: ClusterMetricsListQueryDto = {
      page,
      perPage,
    };
    if (search) {
      query.search = search;
    }
    if (sortBy) {
      query.sortBy = sortBy;
    }

    runInAction(() => {
      this.isLoadingClustersList = true;
      this.clustersListError = null;
      this.clustersListParams = { page, perPage, search };
      this.clustersListSortBy = sortBy ?? null;
    });

    try {
      const response = await api.getAnalyzeClusters(id, query);
      runInAction(() => {
        this.clustersList = response.items;
        this.clustersListTotal = response.total;
        this.clustersListPage = response.page;
        this.clustersListPerPage = response.perPage;
      });
    } catch (error) {
      runInAction(() => {
        this.clustersListError =
          error instanceof Error ? error.message : 'Ошибка загрузки clusters';
      });
    } finally {
      runInAction(() => {
        this.isLoadingClustersList = false;
      });
    }
  };

  get appMetricAverages() {
    return calculateAverages(this.appSnapshotsList, (metrics) => {
      const result: Record<string, unknown> = {};
      Object.entries(APP_METRIC_ACCESSORS).forEach(([field, accessor]) => {
        result[field] = accessor(metrics);
      });
      return result;
    });
  }

  get rootsMetricAverages() {
    return calculateAverages(this.rootsList, (metrics) => {
      const result: Record<string, unknown> = {};
      Object.entries(ROOT_METRIC_ACCESSORS).forEach(([field, accessor]) => {
        result[field] = accessor(metrics);
      });
      return result;
    });
  }

  get serpsMetricAverages() {
    return calculateAverages(this.serpsList, (metrics) => {
      const result: Record<string, unknown> = {};
      Object.entries(SERP_METRIC_ACCESSORS).forEach(([field, accessor]) => {
        result[field] = accessor(metrics);
      });
      return result;
    });
  }

  get clusterMetricAverages() {
    return calculateAverages(this.clustersList, (metrics) => {
      const result: Record<string, unknown> = {};
      const record = metrics as unknown as Record<string, unknown>;
      CLUSTER_METRIC_KEYS.forEach((key) => {
        result[key] = record[key];
      });
      return result;
    });
  }
}

export const analyzeStore = new AnalyzeStore();

