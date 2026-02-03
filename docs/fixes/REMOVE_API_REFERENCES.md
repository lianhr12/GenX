# Remove API References from Content

## Summary

Removed all references to API access and API integration features from documentation, blog posts, and changelogs to align with the decision not to provide public API access.

## Files Modified

### Configuration

- `src/config/footer-config.tsx` - Removed API link from footer navigation

### Documentation

- `content/docs/what-is-genx.mdx` - Removed "API access for developers" from roadmap
- `content/docs/what-is-genx.zh.mdx` - Removed "面向开发者的 API 访问" from roadmap
- `content/docs/account/pricing.mdx` - Removed "API access" from Enterprise Solutions
- `content/docs/account/pricing.zh.mdx` - Removed "API 访问" from Enterprise Solutions

### Blog Posts

- `content/blog/product-launch.mdx` - Removed "API access" from roadmap
- `content/blog/product-launch.zh.mdx` - Removed "API 访问" from roadmap

### Changelogs

- `content/changelog/v1-0-0.mdx` - Removed "API Integration" from core features
- `content/changelog/v1-0-0.zh.mdx` - Removed "API集成" from core features
- `content/changelog/v1-2-0.mdx` - Removed entire "Developer Tools" section
- `content/changelog/v1-2-0.zh.mdx` - Removed entire "开发者工具" section

## What Was Removed

### Navigation

- Footer "Resources" section no longer shows API documentation link

### Feature Mentions

- API access for developers
- API integration capabilities
- Developer tools and SDK
- API endpoints and rate limiting
- Developer console

### Enterprise Features

- API access as an enterprise feature

## What Was Kept

- Internal API request error handling mentions (v1-1-0 changelog) - this refers to internal system API calls, not public API access

## Impact

- Users will no longer see API-related features in documentation
- No navigation paths to API documentation
- Cleaner messaging focused on core video/image generation features
- Enterprise solutions now focus on volume pricing, team accounts, custom integrations, and dedicated support

## Verification

After deployment, verify:

1. Footer navigation does not show API link
2. Documentation pages do not mention API access
3. Blog posts do not promise API features
4. Changelogs reflect accurate feature history without API references

## Notes

This change aligns the public-facing content with the product strategy of not providing public API access. All references have been cleanly removed while maintaining the integrity of the documentation structure.
