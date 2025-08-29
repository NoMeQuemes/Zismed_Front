import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PatientSideBar from '../Guardia/PatientSideBar.vue'

describe('PatientSideBar', () => {
  it('renders correctly', () => {
    const wrapper = mount(PatientSideBar)
    expect(wrapper.exists()).toBe(true)
  })
})
