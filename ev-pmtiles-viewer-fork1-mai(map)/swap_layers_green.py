import glob
import re
import os

files = glob.glob('src/components/layers/parcels-m*.js')

# Pattern for the green layer (parcels-layers uses #98c379 which is a green, 
# but individual files have different colors. The user says "green layer".
# Looking at parcels-layers.js, it defines layerColor = '#98c379'.
# However, the individual files like parcels-m05.js define their own colors.
# Wait, parcels-layers.js is a manager, not a layer adder.
# The user might be referring to the ParcelsLayers group or one specific layer.
# But all files follow the same pattern.
# Let's check parcels-layers.js content again.

# Actually, the user says "the green layer is still on top".
# Maybe they mean the "parcels" fill layer itself?
# Or maybe there is another layer that is green.
# Let's search for green color usage.

# Wait, if the parcels are filled, they block the click if they are on top of something?
# No, fill layers capture clicks.
# If "green layer" is on top, maybe it's the 3D buildings?
# 3D buildings are extruded.
# In map.js, 3D buildings are added.
# Let's look at map.js again.
# It uses fill-extrusion-color with interpolate.
# 100, '#E5C07B' (Gold)
# 50, '#3e4452' (Gray)
# 0, '#1e2127' (Dark Gray)
# So buildings are not green.

# Let's check if any parcel layer is green.
# parcels-m00: #808080 (Gray)
# parcels-m01: ?
# parcels-m02: ?
# parcels-m05: #FF69B4 (Hot Pink)

# Let's search for green hex codes.
