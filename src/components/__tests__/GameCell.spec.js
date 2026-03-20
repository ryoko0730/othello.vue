import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import GameCell from '../GameCell.vue';

describe('GameCell.vue', () => {
  it('黒石(1)を受け取った時に黒石が表示される', () => {
    const wrapper = mount(GameCell, {
      props: { disc: 1 }
    });
    // .disc と .black クラスの両方が存在することを確認
    expect(wrapper.find('.disc.black').exists()).toBe(true);
  });

  it('白石(-1)を受け取った時に白石が表示される', () => {
    const wrapper = mount(GameCell, {
      props: { disc: -1 }
    });
    expect(wrapper.find('.disc.white').exists()).toBe(true);
  });

  it('クリックしたときに "click" イベントが発生する', async () => {
    const wrapper = mount(GameCell, {
      props: { disc: 0 }
    });
    await wrapper.trigger('click');
    // emit されたイベントの配列に 'click' が含まれているか確認
    expect(wrapper.emitted()).toHaveProperty('click');
  });
});
