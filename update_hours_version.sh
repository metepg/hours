#!/usr/bin/env bash
set -e

NEW_VERSION="$1"

if [ -z "$NEW_VERSION" ]; then
  echo "Usage: ./update_hours_version.sh 1.2.3"
  exit 1
fi

# Validate semantic version (x.x.x)
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in semantic form e.g., 1.2.3"
  exit 1
fi

git checkout dev
git pull origin dev

# Update Maven version
mvn versions:set -DnewVersion="$NEW_VERSION" -DgenerateBackupPoms=false

# Update npm version
npm --prefix client version "$NEW_VERSION" --no-git-tag-version

# Commit changes
git add pom.xml server/pom.xml
git add client/package.json client/package-lock.json
git commit -m "Version $NEW_VERSION"

# Merge dev into main with fast-forward only (no merge commit)
git checkout main
git merge --ff-only dev

# Create tag
git tag -a v$NEW_VERSION -m "Release version v$NEW_VERSION"

# Confirm
read -p "Do you want to push changes remote? (y/n): " ANSWER
if [[ "$ANSWER" =~ ^[Yy]$ ]]; then
  git push origin dev
  git push origin main
  git push origin v$NEW_VERSION
  echo "Pushed changes remote."
else
  echo "Skipped pushing to remote."
fi

git checkout dev

echo "Done."
