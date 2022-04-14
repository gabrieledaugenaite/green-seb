import { DropdownArgs } from '@sebgroup/extract'
import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from '@testing-library/angular'
import { NggDropdownComponent } from './dropdown.component'

describe('Dropdown', () => {
  let component: RenderResult<NggDropdownComponent>
  let props: DropdownArgs
  let toggleButton: HTMLElement
  let listbox: HTMLElement
  let options: HTMLElement[]
  beforeEach(async () => {
    props = {
      options: [
        { key: 'A', value: 1 },
        { key: 'B', value: 2 },
        { key: 'C', value: 3 },
      ],
    }
    component = await render(NggDropdownComponent, {
      componentProperties: { ...props },
    })

    const [_buttons, _listboxes, _options] = [
      await component.findAllByRole('button'),
      await component.findAllByRole('listbox'),
      await component.findAllByRole('option'),
    ]

    toggleButton = _buttons[0]
    listbox = _listboxes[0]
    options = _options
  })
  it('renders', () => {
    expect(component.fixture.componentInstance).toBeTruthy()
  })
  it('sets correct classes on dropdown toggle', async () => {
    expect(toggleButton.className).toEqual('dropdown-toggle')
  })
  it('renders options', () => {
    expect(options).toHaveLength(3)
  })
  describe('toggle', () => {
    it('sets aria-expanded on trigger', async () => {
      // initial
      expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

      // open
      fireEvent.click(toggleButton)
      await waitFor(() =>
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('true')
      )

      // close
      fireEvent.click(toggleButton)
      await waitFor(() =>
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
      )
    })
    it('sets class active on listbox', async () => {
      // initial
      expect(listbox.className).toEqual('popover')

      // open
      fireEvent.click(toggleButton)
      await waitFor(() => expect(listbox.className).toEqual('popover active'))

      // close
      fireEvent.click(toggleButton)
      await waitFor(() => expect(listbox.className).toEqual('popover'))
    })
  })
  describe('mouse interaction', () => {
    beforeEach(() => {
      fireEvent.click(toggleButton)
    })
    describe('click option', () => {
      it('sets aria-selected', async () => {
        fireEvent.click(options[1])
        await waitFor(() =>
          expect(options[1].getAttribute('aria-selected')).toEqual('true')
        )
      })
      it('closes dropdown', async () => {
        fireEvent.click(options[1])
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
        await waitFor(() => expect(listbox.className).toEqual('popover'))
      })
      it('sets toggler text', async () => {
        fireEvent.click(options[1])
        await waitFor(() =>
          expect(toggleButton.innerHTML.trim()).toEqual('<span>B</span>')
        )
      })
    })
    describe('click outside', () => {
      it('closes the dropdown', async () => {
        fireEvent.click(document.body)
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
    })
  })
  describe('keyboard navigation', () => {
    describe('Space', () => {
      it('does nothing when inactive', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        fireEvent.keyDown(document, { key: ' ' })
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
      it('opens when active', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        toggleButton.focus()
        fireEvent.keyDown(document, { key: ' ' })

        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('true')
        )
      })
      it('closes when open', async () => {
        fireEvent.click(toggleButton)
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('true')
        )

        toggleButton.focus()
        fireEvent.keyDown(document, { key: ' ' })

        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
    })
    describe('Escape', () => {
      it('does nothing when inactive', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        fireEvent.keyDown(document, { key: 'Escape' })
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
      it('does nothing when not open', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        toggleButton.focus()
        fireEvent.keyDown(document, {
          key: 'Escape',
        })

        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
      it('closes when open', async () => {
        fireEvent.click(toggleButton)
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('true')
        )

        toggleButton.focus()
        fireEvent.keyDown(document, {
          key: 'Escape',
        })

        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
    })
    describe('ArrowDown', () => {
      it('does nothing when inactive', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        fireEvent.keyDown(document, { key: 'ArrowDown' })
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
      it('opens when active', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        toggleButton.focus()
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })

        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('true')
        )
      })
      it('selects next when open', async () => {
        toggleButton.focus()

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[1].getAttribute('aria-selected')).toEqual('true')
        )
      })
      it('stops on last when not looping', async () => {
        toggleButton.focus()

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[1].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )
      })
      it.skip('loops to first when looping', async () => {
        component.rerender({ ...props, loop: true })

        const [_buttons, _listboxes, _options] = [
          await component.findAllByRole('button'),
          await component.findAllByRole('listbox'),
          await component.findAllByRole('option'),
        ]

        toggleButton = _buttons[0]
        listbox = _listboxes[0]
        options = _options

        toggleButton.focus()

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[1].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )
      })
    })
    describe('ArrowUp', () => {
      it('does nothing when inactive', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        fireEvent.keyDown(document, { key: 'ArrowUp' })
        // TODO: await tick(50)
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
      })
      it('opens when active', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        toggleButton.focus()
        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })

        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('true')
        )
      })
      it('selects previous when open', async () => {
        toggleButton.focus()
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        await waitFor(() =>
          expect(options[1].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )
      })
      it('stops on first when not looping', async () => {
        toggleButton.focus()

        // go to last option
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )

        // spam up
        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )
      })
      it.skip('loops to first when looping', async () => {
        component.rerender({ ...props, loop: true })

        toggleButton.focus()

        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        await waitFor(() =>
          expect(options[1].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, {
          key: 'ArrowUp',
        })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )
      })
    })
    describe('Home', () => {
      it('does nothing when inactive', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        fireEvent.keyDown(document, { key: 'Home' })
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
      it('opens and selects first when active', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        toggleButton.focus()
        fireEvent.keyDown(document, { key: 'Home' })

        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('true')
        )
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )
      })
      it('selects first when open', async () => {
        toggleButton.focus()
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, { key: 'Home' })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )
      })
    })
    describe('End', () => {
      it('does nothing when inactive', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        fireEvent.keyDown(document, { key: 'End' })
        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')
        )
      })
      it('opens and selects last when active', async () => {
        expect(toggleButton.getAttribute('aria-expanded')).toEqual('false')

        toggleButton.focus()
        fireEvent.keyDown(document, { key: 'End' })

        await waitFor(() =>
          expect(toggleButton.getAttribute('aria-expanded')).toEqual('true')
        )
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )
      })
      it('selects last when open', async () => {
        toggleButton.focus()
        fireEvent.keyDown(document, {
          key: 'ArrowDown',
        })
        await waitFor(() =>
          expect(options[0].getAttribute('aria-selected')).toEqual('true')
        )

        fireEvent.keyDown(document, { key: 'End' })
        await waitFor(() =>
          expect(options[2].getAttribute('aria-selected')).toEqual('true')
        )
      })
    })
  })
})
