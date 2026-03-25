### Branch Strategy Guidance

#### **Branching Model**
1. **Main Branch (`main`)**:
    - The `main` branch is the stable branch that always contains production-ready code.
    - All changes must be tested and verified before merging into `main`.

2. **Feature Branches**:
    - Use feature branches for developing new features or enhancements.
    - Naming convention: `feature/<feature-name>`.
    - Example: `feature/add-user-upload`.

3. **Fix Branches**:
    - Use fix branches for bug fixes or patches.
    - Naming convention: `fix/<bug-description>`.
    - Example: `fix/csv-upload-error`.

4. **Hotfix Branches**:
    - Use hotfix branches for urgent fixes to the `main` branch.
    - Naming convention: `hotfix/<issue-description>`.
    - Example: `hotfix/export-crash`.

#### **Workflow**
1. **Create a Branch**:
    - Create a new branch from `main` for each feature, fix, or hotfix.
    - Example:
      ```bash
      git checkout -b feature/add-user-upload
      ```

2. **Develop and Test**:
    - Implement the changes in the branch.
    - Test the changes locally to ensure they work as expected.

3. **Merge into `main`**:
    - Once the changes are complete and tested, merge the branch into `main`.
    - Example:
      ```bash
      git checkout main
      git merge feature/add-user-upload
      ```

4. **Delete the Branch**:
    - After merging, delete the branch to keep the repository clean.
    - Example:
      ```bash
      git branch -d feature/add-user-upload
      ```

#### **Best Practices**
- Keep branches small and focused on a single task.
- Regularly pull updates from `main` to keep the branch up-to-date.
- Use clear and descriptive branch names.
- Test thoroughly before merging to ensure stability.