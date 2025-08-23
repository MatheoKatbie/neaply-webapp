'use client'

import { MultiSelect } from '@/components/ui/multi-select'
import type { Category, Tag } from '@/types/workflow'

interface WorkflowCategoriesSectionProps {
  categoryIds: string[]
  tagIds: string[]
  categories: Category[]
  tags: Tag[]
  onUpdate: (field: string, value: any) => void
  errors: Record<string, string>
  touched: Record<string, boolean>
  onBlur: (field: string) => void
  categoriesLoading: boolean
  tagsLoading: boolean
}

export function WorkflowCategoriesSection({
  categoryIds,
  tagIds,
  categories,
  tags,
  onUpdate,
  errors,
  touched,
  onBlur,
  categoriesLoading,
  tagsLoading,
}: WorkflowCategoriesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="space-y-2">
          <MultiSelect
            label="Categories *"
            options={categories}
            selected={categoryIds || []}
            onChange={(selected) => {
              onUpdate('categoryIds', selected)
              onBlur('categoryIds')
            }}
            placeholder="Select at least one category..."
            disabled={categoriesLoading}
            className="w-full"
          />
          {touched.categoryIds && errors.categoryIds && <p className="text-xs text-red-500">{errors.categoryIds}</p>}
          <p className="text-xs text-muted-foreground">
            Select categories that best describe your workflow's purpose and functionality
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <MultiSelect
            label="Tags *"
            options={tags}
            selected={tagIds || []}
            onChange={(selected) => {
              onUpdate('tagIds', selected)
              onBlur('tagIds')
            }}
            placeholder="Select at least one tag..."
            disabled={tagsLoading}
            className="w-full"
          />
          {touched.tagIds && errors.tagIds && <p className="text-xs text-red-500">{errors.tagIds}</p>}
          <p className="text-xs text-muted-foreground">Add relevant tags to help users discover your workflow</p>
        </div>
      </div>

      {/* Loading states */}
      {(categoriesLoading || tagsLoading) && (
        <div className="space-y-2">
          {categoriesLoading && <p className="text-sm text-muted-foreground">Loading categories...</p>}
          {tagsLoading && <p className="text-sm text-muted-foreground">Loading tags...</p>}
        </div>
      )}

      {/* Selected items summary */}
      {(categoryIds?.length > 0 || tagIds?.length > 0) && (
        <div className="space-y-3">
          {categoryIds?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Categories:</p>
              <div className="flex flex-wrap gap-2">
                {categoryIds.map((categoryId) => {
                  const category = categories.find((c) => c.id === categoryId)
                  return category ? (
                    <span
                      key={categoryId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {category.name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          {tagIds?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Tags:</p>
              <div className="flex flex-wrap gap-2">
                {tagIds.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId)
                  return tag ? (
                    <span
                      key={tagId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag.name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
