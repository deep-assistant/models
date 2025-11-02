#!/usr/bin/env python3
"""
Convert TOML model files to .lino (Links Notation) format
"""

import tomli
import sys
from pathlib import Path


def format_number(value):
    """Format numbers with spaces as thousands separators"""
    if isinstance(value, int):
        return f"'{value:,}".replace(',', ' ') + "'"
    return str(value)


def toml_to_lino(toml_content):
    """Convert TOML content to .lino format"""
    data = tomli.loads(toml_content)

    lines = []

    # Model name
    model_name = data.get('name', '')
    lines.append(f"model '{model_name}'")

    # Release date
    if 'release_date' in data:
        lines.append(f"  released at")
        lines.append(f"    {data['release_date']}")

    # Last updated
    if 'last_updated' in data:
        lines.append(f"  last updated at")
        lines.append(f"    {data['last_updated']}")

    # Knowledge cutoff
    if 'knowledge' in data:
        lines.append(f"  has knowledge cutoff at")
        lines.append(f"    {data['knowledge']}")

    # Weights
    if 'open_weights' in data:
        weights_status = 'open' if data['open_weights'] else 'closed'
        lines.append(f"  weights")
        lines.append(f"    {weights_status}")

    # Capabilities
    capabilities = []
    if data.get('reasoning'):
        capabilities.append('reasoning')
    if data.get('tool_call'):
        capabilities.append('tool calls')
    if data.get('temperature'):
        capabilities.append('temperature')
    if data.get('attachment'):
        capabilities.append('attachments')

    if capabilities:
        lines.append(f"  capabilities")
        lines.append(f"    (")
        for cap in capabilities:
            lines.append(f"      {cap}")
        lines.append(f"    )")

    # Modalities
    if 'modalities' in data:
        modalities = data['modalities']
        lines.append(f"  modalities")

        if 'input' in modalities:
            lines.append(f"    input")
            input_mods = ' '.join(modalities['input'])
            lines.append(f"      {input_mods}")

        if 'output' in modalities:
            lines.append(f"    output")
            output_mods = ' '.join(modalities['output'])
            lines.append(f"      {output_mods}")

    # Limits
    if 'limit' in data:
        limit = data['limit']
        lines.append(f"  limits")

        if 'context' in limit:
            lines.append(f"    context")
            lines.append(f"      {format_number(limit['context'])}")

        if 'output' in limit:
            lines.append(f"    output")
            lines.append(f"      {format_number(limit['output'])}")

    # Costs
    if 'cost' in data:
        cost = data['cost']
        lines.append(f"  costs")

        if 'input' in cost:
            lines.append(f"    input")
            lines.append(f"      {cost['input']:.2f}")

        if 'output' in cost:
            lines.append(f"    output")
            lines.append(f"      {cost['output']:.2f}")

        if 'cache_read' in cost:
            lines.append(f"    cacheRead")
            lines.append(f"      {cost['cache_read']:.2f}")

        if 'cache_write' in cost:
            lines.append(f"    cacheWrite")
            lines.append(f"      {cost['cache_write']:.2f}")

    return '\n'.join(lines)


def main():
    if len(sys.argv) != 3:
        print("Usage: toml_to_lino.py <input.toml> <output.lino>")
        sys.exit(1)

    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])

    if not input_file.exists():
        print(f"Error: Input file {input_file} does not exist")
        sys.exit(1)

    toml_content = input_file.read_text()
    lino_content = toml_to_lino(toml_content)

    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(lino_content)

    print(f"Converted {input_file} -> {output_file}")


if __name__ == "__main__":
    main()
