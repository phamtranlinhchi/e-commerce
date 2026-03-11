// =============================================================================
// Category-related type definitions
// =============================================================================

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  parentId: string | null;
}

export interface CategoryDetail extends CategoryWithCount {
  children: CategoryWithCount[];
}
