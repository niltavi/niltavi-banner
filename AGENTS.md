# Repository guidance

Before editing, load the [Niltavi project Skill](.agents/skills/niltavi-project/SKILL.md) and follow it to read the current [Niltavi Rules](https://github.com/niltavi/niltavi-rules#readme), [Niltavi Skills](https://github.com/niltavi/niltavi-skills#readme), and [Niltavi UI](https://github.com/niltavi/niltavi-ui#readme).

Keep the rendering engine independent of the preview DOM and external services. Preserve the artwork produced by existing seeds unless the change intentionally updates it. Verify any rendering change with the commands in the [integration guide](docs/en/for-agents.md), then open `index.html` and check PNG export.
