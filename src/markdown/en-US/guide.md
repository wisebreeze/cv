# Terminology Explanation

### HUD
**Explanation**: Real-time game overlay displaying information (health bar, hotbar, etc.)

### Operate All
**Explanation**: Perform transfer or discard operations on all items within a specified range

**Detailed Explanation**: 
For example:
- "Take All" button in the bottom right of a container transfers all items from the container to player's inventory
- "Deposit All" button transfers all items from player's inventory to the container
- In discard mode, the transfer operation becomes a discard operation

### Chain Operation
**Explanation**: Clicking on a single item will perform transfer/discard operations on all identical items

### HUD Quick Access
**Explanation**: Directly access specific settings from the game interface without pausing

**Enable Method**:
1. Enable: Custom > Settings > Settings > Quick Access on HUD

### Cube Panel
**Definition**: Customizable configuration panel

**Explanation**: 
- Double-click the bottom left corner of pause screen to open
- Customize game interface elements
- Configurations reset when exiting world or changing dimensions
- Default options can be configured on customization website

**Enable Method**:
1. Enable: Custom > Panel > Basic > Enable Panel

### Cube Panel - Functions Only
**Definition**: Panel settings take effect without opening the actual panel

**Explanation**: Game interface configurations are controlled through customization settings

**Enable Method**:
1. Enable: Custom > Panel > Basic > Enable Panel

### Chunk Map
**Explanation**: Visual map showing 16x16 chunk boundaries around player

**Dependency**: Requires "Show Coordinates" in world settings

**Enable Methods**:
1. Enable: Custom > Settings > HUD > Chunk Map
2. With Cube Panel enabled: Custom > Panel > Chunk Map > Set as default

### Paperdoll
**Explanation**: 3D model of player character displayed in UI

### Toolbox
**Explanation**: Secondary menu containing additional function buttons

### Partial Blur
**Effect**: Blur effect applied to backgrounds of certain UI elements

### Data Overview
**Explanation**: Displays numerical values instead of icons for items like compass (showing 180° instead of icon)

**Dependency**: Requires Data Overview extension

### Redstone Power Display
**Explanation**: Shows redstone power level of containers (same as comparator output)

### Command Enhancement
**Explanation**: Allows scrolling through command suggestions in chat

### Control Gloss
**Explanation**: Adds highlight effects to edges of UI controls

### Assist Crosshair
**Explanation**: Displays additional crosshair when holding throwable items or fishing rod

### On/Off Labels
**Explanation**: Shows O/I indicators on toggle switches

### Hotbar Selection Color Animation
**Explanation**: Selected item in hotbar shows color gradient animation

### Rounded Hotbar
**Explanation**: Hotbar uses rounded rectangle style

### Collapse Enchantment Info
**Explanation**: Item text shows only one line, hiding enchantment attributes in HUD

### Ambient Rendering
**Explanation**: Displays black edges at low altitudes (untested feature)

### Auxiliary Items
**Explanation**: Clock, compass, recovery compass

### Operate All for Single Row
**Explanation**: "Operate All" applies only to items in a single row (e.g., just hotbar)

### Item Grid Spacing
**Explanation**: Displays item slots with grid-style spacing

### Force Operation
**Explanation**: Maintains current action continuously
Example: Continuous sprinting when enabled (except when prevented by commands)

### Notebook
**Explanation**: Temporary text storage for notes like coordinates
Access via: Settings > Resource Packs (Global Resources) > CubeVisage Resource Pack Settings
Text entered here is saved persistently