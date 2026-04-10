import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // globals: true, // Mochaのように describe や it をグローバル変数として扱う
        // 各テストの前に自動で vi.clearAllMocks() を実行する設定
        clearMocks: true,
        coverage: {
            clean: true, // 実行前に古いレポートを削除
            cleanOnRerun: true, // 実行前に古いレポートを削除
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
        include: [
            'src/**/*.test.ts',
            'src/**/*.spec.ts'
        ],
    }
})