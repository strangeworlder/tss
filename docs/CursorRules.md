## Docker Development

### Container Execution
- **Always run commands inside the appropriate container:**
  - Use `docker exec -it <container_name> sh` to enter the container shell
  - NEVER execute npm/node commands directly on the host machine
  - All npm install/link operations must be performed inside the container
  - When asked to run a command, prepend with `docker exec -it <container_name> sh -c "command"`

### Module Resolution
- **Workspace package resolution in Docker:**
  - Docker volume mapping may affect npm workspace resolution
  - For import errors with `@shared/types`, try the following solutions in order:
    1. Check symlinks in container: `ls -la /app/front/node_modules/@shared`
    2. Create symlink manually if missing: `mkdir -p /app/front/node_modules/@shared && ln -sf /app/shared /app/front/node_modules/@shared/types`
    3. Verify Vite config has correct `resolve.alias` settings for Docker
    4. Check tsconfig.app.json path mappings are correct for the Docker environment
    5. Rebuild node_modules in container: `rm -rf node_modules && npm install`
  - NEVER use relative import paths as a workaround (e.g., '../../../shared')
  - ALWAYS use workspace package name imports (e.g., '@shared/types/blog')

### Docker-specific Configuration
- **Vite configuration for Docker:**
  - Set `fs.allow: ['..']` and `fs.strict: false` in Vite config
  - Set `preserveSymlinks: true` in resolve options
  - Use absolute paths with `join(projectRoot, 'shared')` for aliases
  - Include shared packages in `optimizeDeps.include`
- **Package.json configuration:**
  - Ensure workspace package references use proper format: `"@shared/types": "1.0.0"`
  - Never use file paths for workspace references

### Docker Debugging
- **For persistent module resolution issues:**
  - Check Docker logs: `docker logs <container_name>`
  - Verify container filesystem structure: `docker exec -it <container_name> sh -c "ls -la /app"`
  - Check node_modules symlinks: `docker exec -it <container_name> sh -c "ls -la /app/front/node_modules/@shared"`
  - Check if Docker volumes are mapped correctly in docker-compose.yml
  - Consider using Docker debugging configurations in IDE 