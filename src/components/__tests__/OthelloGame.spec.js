import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import OthelloGame from '../OthelloGame.vue';

describe('OthelloGame.vue', () => {
  beforeEach(() => {
    // タイマー系のテスト（setTimeout）を扱うための設定
    vi.useFakeTimers();
  });

  it('初期状態で中央に4つの石が配置されている', () => {
    const wrapper = mount(OthelloGame);
    // 黒(1)が2つ、白(-1)が2つあるか確認
    // 盤面データ(cells)に直接アクセスして検証
    const flatCells = wrapper.vm.cells.flat();
    const blackCount = flatCells.filter(c => c === 1).length;
    const whiteCount = flatCells.filter(c => c === -1).length;
    
    expect(blackCount).toBe(2);
    expect(whiteCount).toBe(2);
  });

  it('ルール上置けない場所をクリックしても何も起きない', async () => {
    const wrapper = mount(OthelloGame);
    // (0,0) は初期状態では置けない場所
    const initialCells = JSON.stringify(wrapper.vm.cells);
    
    // 盤面コンポーネントのセルクリックをシミュレート
    // emit を直接叩くか、コンポーネント経由で操作
    await wrapper.findComponent({ name: 'GameBoard' }).vm.$emit('cell-click', 0, 0);
    
    // 盤面が変わっていないことを確認
    expect(JSON.stringify(wrapper.vm.cells)).toBe(initialCells);
  });

  it('有効な場所をクリックすると石が置かれ、ターンが交代する', async () => {
    const wrapper = mount(OthelloGame);
    // 初期状態で黒(1)が置ける場所の一つは (2, 4) 
    await wrapper.findComponent({ name: 'GameBoard' }).vm.$emit('cell-click', 2, 4);
    
    // (2, 4) に黒石(1)が置かれているか
    expect(wrapper.vm.cells[2][4]).toBe(1);
    
    // ターンが交代して、次は白(-1)の番になっているか
    expect(wrapper.vm.myStoneColor).toBe(-1);
  });

  it('CPUのターンになると自動で石が置かれる', async () => {
    const wrapper = mount(OthelloGame);
    
    // プレイヤー(黒)が有効な場所 (2, 4) に置く
    await wrapper.findComponent({ name: 'GameBoard' }).vm.$emit('cell-click', 2, 4);
    
    // CPUの思考時間(500ms)をスキップ
    vi.advanceTimersByTime(500);
    
    // 白石の数が増えているか確認（初期2個から増えているはず）
    const whiteCount = wrapper.vm.cells.flat().filter(c => c === -1).length;
    expect(whiteCount).toBeGreaterThan(2);
  });
});
