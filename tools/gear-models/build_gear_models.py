"""Build compact, locally hosted GLB models for the portfolio gear viewer.

Run with Blender in background mode. Geometry uses manufacturer dimensions where
available and the supplied product cutouts as visual references. Hidden surfaces
are modeled conservatively when the reference photos do not show them.
"""

from __future__ import annotations

import math
import os
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "public" / "gear" / "models"
REVIEW_DIR = Path(os.environ.get("GEAR_REVIEW_DIR", "")) if os.environ.get("GEAR_REVIEW_DIR") else None
TAU = math.tau


def material(name, color, roughness=0.55, metallic=0.0, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    if emission is not None:
        shader.inputs["Emission Color"].default_value = (*emission, 1.0)
        shader.inputs["Emission Strength"].default_value = emission_strength
    return mat


def darken(mat, amount=0.35):
    color = mat.diffuse_color[:3]
    return material(f"{mat.name} shadow", tuple(channel * amount for channel in color), .62, .08)


def apply_material(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


def finish_mesh(obj, bevel=0.0, segments=3, smooth=True):
    if bevel > 0:
        mod = obj.modifiers.new("Manufactured edge radius", "BEVEL")
        mod.width = bevel
        mod.segments = segments
        mod.limit_method = "ANGLE"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
    if smooth:
        for face in obj.data.polygons:
            face.use_smooth = True
        normal = obj.modifiers.new("Weighted edge normals", "WEIGHTED_NORMAL")
        normal.keep_sharp = True
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=normal.name)
    return obj


def box(name, location, dimensions, mat, bevel=0.02, segments=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    apply_material(obj, mat)
    return finish_mesh(obj, min(bevel, min(dimensions) * 0.48), segments)


def cylinder(name, location, radius, depth, mat, axis="Y", vertices=40, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    if axis == "Y":
        obj.rotation_euler.x = math.pi / 2
    elif axis == "X":
        obj.rotation_euler.y = math.pi / 2
    apply_material(obj, mat)
    return finish_mesh(obj, bevel)


def sphere(name, location, scale, mat, segments=32, rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    apply_material(obj, mat)
    return finish_mesh(obj, smooth=True)


def rod(name, start, end, radius, mat, vertices=16):
    a, b = Vector(start), Vector(end)
    direction = b - a
    obj = cylinder(name, (a + b) / 2, radius, direction.length, mat, axis="Z", vertices=vertices)
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    return obj


def path(name, points, radius, mat, cyclic=False, resolution=2):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 12
    curve.bevel_depth = radius
    curve.bevel_resolution = resolution
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for point, co in zip(spline.points, points):
        point.co = (*co, 1.0)
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    apply_material(obj, mat)
    return obj


def text_mesh(name, content, location, size, mat, rotation=(math.pi / 2, 0, 0), align="CENTER", extrude=0.0006):
    font = bpy.data.curves.new(name, "FONT")
    font.body = content
    font.size = size
    font.extrude = extrude
    font.bevel_depth = extrude * 0.2
    font.align_x = align
    font.align_y = "CENTER"
    obj = bpy.data.objects.new(name, font)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    obj.rotation_euler = rotation
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    obj = bpy.context.object
    apply_material(obj, mat)
    obj.select_set(False)
    return obj


def roundrect_loop(cx, cy, cz, width, depth, radius, steps=5):
    points = []
    for center_x, center_z, start in [
        (cx + width / 2 - radius, cz + depth / 2 - radius, 0),
        (cx - width / 2 + radius, cz + depth / 2 - radius, 90),
        (cx - width / 2 + radius, cz - depth / 2 + radius, 180),
        (cx + width / 2 - radius, cz - depth / 2 + radius, 270),
    ]:
        for step in range(steps + 1):
            angle = math.radians(start + step * 90 / steps)
            points.append((center_x + math.cos(angle) * radius, cy,
                           center_z + math.sin(angle) * radius))
    return points


def label_on_top(name, content, x, y, z, size, mat, align="CENTER"):
    # Glyph tops face toward the keyboard's rear (negative Z), as on the keycaps.
    return text_mesh(name, content, (x, y, z), size, mat, rotation=(-math.pi / 2, 0, 0), align=align, extrude=0.0003)


def rounded_plate(name, cx, y, cz, width, depth, radius, thickness, mat, steps=5):
    upper = roundrect_loop(cx, y + thickness / 2, cz, width, depth, radius, steps)
    lower = roundrect_loop(cx, y - thickness / 2, cz, width, depth, radius, steps)
    count = len(upper)
    verts = upper + lower
    faces = [tuple(range(count)), tuple(range(count, count * 2))]
    faces.extend((i, (i + 1) % count, (i + 1) % count + count, i + count) for i in range(count))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return finish_mesh(obj, bevel=min(thickness * 0.12, radius * 0.12), smooth=False)


def rounded_hull(name, sections, mat, side_steps=24):
    """Loft elliptical mouse shell rings along Z; sections are z, width, height."""
    # Linear key sections with a cosine ease keep the hand-fitted contour stable.
    expanded = []
    for left, right in zip(sections, sections[1:]):
        for i in range(5):
            t = i / 5
            t = t * t * (3 - 2 * t)
            expanded.append(tuple(a + (b - a) * t for a, b in zip(left, right)))
    expanded.append(sections[-1])
    verts, faces = [], []
    base_y = 0.045
    for z, width, height in expanded:
        for i in range(side_steps):
            angle = TAU * i / side_steps
            verts.append((math.sin(angle) * width, base_y + (0.5 + 0.5 * math.cos(angle)) * height, z))
    ring_count = len(expanded)
    for ring in range(ring_count - 1):
        for i in range(side_steps):
            a = ring * side_steps + i
            b = ring * side_steps + (i + 1) % side_steps
            faces.append((a, a + side_steps, b + side_steps, b))
    faces.append(tuple(range(side_steps)))
    faces.append(tuple(reversed([(ring_count - 1) * side_steps + i for i in range(side_steps)])))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.materials.append(mat)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for polygon in mesh.polygons:
        polygon.use_smooth = len(polygon.vertices) == 4
    return obj


def create_laptop(mats):
    black, graphite, dark, key, key_legend, rgb_red, rgb_pink, glass, silver = mats
    # ASUS lists a 395 x 282 mm G713 chassis and a 17.3-inch panel.
    box("ROG Strix G17 lower shell", (0, -0.74, 0.02), (3.95, 0.15, 2.82), black, 0.075, 5)
    box("Upper keyboard deck", (0, -0.647, 0.02), (3.84, 0.045, 2.70), graphite, 0.07, 5)
    box("Keyboard switch plate", (0, -0.615, -0.30), (3.42, 0.018, 1.20), dark, 0.025, 3)

    # Individual raised keycaps rather than a printed flat keyboard surface.
    rows = [
        [("Esc", .72), ("F1", 1), ("F2", 1), ("F3", 1), ("F4", 1), ("F5", 1), ("F6", 1), ("F7", 1), ("F8", 1), ("F9", 1), ("F10", 1), ("F11", 1), ("F12", 1), ("Num", 1)],
        [("~", 1), ("1", 1), ("2", 1), ("3", 1), ("4", 1), ("5", 1), ("6", 1), ("7", 1), ("8", 1), ("9", 1), ("0", 1), ("-", 1), ("=", 1), ("Bksp", 1.5)],
        [("Tab", 1.35), ("Q", 1), ("W", 1), ("E", 1), ("R", 1), ("T", 1), ("Y", 1), ("U", 1), ("I", 1), ("O", 1), ("P", 1), ("[", 1), ("]", 1), ("Enter", 1.5)],
        [("Caps", 1.5), ("A", 1), ("S", 1), ("D", 1), ("F", 1), ("G", 1), ("H", 1), ("J", 1), ("K", 1), ("L", 1), (";", 1), ("'", 1), ("Enter", 1.5)],
        [("Shift", 1.8), ("Z", 1), ("X", 1), ("C", 1), ("V", 1), ("B", 1), ("N", 1), ("M", 1), (",", 1), (".", 1), ("/", 1), ("Shift", 1.5), ("↑", 1)],
        [("Ctrl", 1), ("Fn", 1), ("Win", 1), ("Alt", 1), ("Space", 5), ("Alt", 1), ("Ctrl", 1), ("←", 1), ("↓", 1), ("→", 1)],
    ]
    key_pitch = 0.214
    for row_index, row in enumerate(rows):
        width_units = sum(weight for _, weight in row) + 0.14 * (len(row) - 1)
        x = -width_units * key_pitch / 2
        z = -0.79 + row_index * 0.247
        for legend, weight in row:
            w = (weight - 0.09) * key_pitch
            d = 0.205
            x_center = x + weight * key_pitch / 2
            cap_mat = rgb_pink if legend in ("W", "A", "S", "D") else black if legend == "Space" else key
            box(f"G17 {legend} keycap", (x_center, -0.586, z), (w, 0.052, d), cap_mat, 0.025, 3)
            label_on_top(f"G17 {legend} legend", legend, x_center, -0.557, z - 0.005, 0.043, key_legend)
            x += (weight + 0.14) * key_pitch

    # Long palm rest, actual wide recessed touchpad, speaker grids and a narrow RGB front edge.
    box("Wide precision touchpad", (0, -0.608, 0.92), (1.20, 0.012, 0.66), dark, 0.055, 5)
    box("Touchpad inset", (0, -0.599, 0.92), (1.12, 0.008, 0.58), black, 0.05, 5)
    for side in (-1, 1):
        for row in range(14):
            for col in range(3):
                box("Speaker perforation", (side * (1.64 + col * 0.065), -0.613, -0.16 + row * 0.047),
                    (0.022, 0.006, 0.018), dark, 0.006, 2)
        box("Palmrest edge accent", (side * 1.84, -0.66, 0.96), (0.012, 0.012, 0.42), rgb_pink, 0.005, 2)
    for i in range(48):
        x = -1.75 + i * (3.5 / 47)
        box("Front RGB lightbar diffuser", (x, -0.81, 1.435), (0.069, 0.024, 0.018), rgb_pink if i < 25 else rgb_red, 0.006, 2)
    # Rear exhaust banks and representative port cutouts on both sides.
    for side in (-1, 1):
        for i in range(13):
            box("Rear exhaust fin", (side * (0.79 + i * 0.042), -0.735, -1.403),
                (0.018, 0.062, 0.013), dark, 0.004, 2)
        for port_z, height in [(-0.78, .085), (-0.43, .11), (-0.12, .11), (0.28, .12)]:
            box("Side I/O recess", (side * 1.981, -0.744, port_z), (0.012, height, 0.18), dark, 0.012, 3)
        for foot_z in (-1.14, 1.08):
            box("Rubber chassis foot", (side * 1.50, -0.827, foot_z), (0.62, 0.025, 0.12), dark, 0.03, 3)
    for i in range(21):
        box("Underside cooling vent", (-1.50 + i * 0.15, -0.821, -0.08), (0.065, 0.009, 0.36), dark, 0.008, 2)

    # Lid pivot location is at the back of the chassis; separate object groups preserve a true open lid.
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, -0.665, -1.30))
    pivot = bpy.context.object
    pivot.name = "ROG lid hinge pivot"
    lid_parts = []
    lid_parts.append(box("17.3 inch display housing", (0, 0.43, 0), (3.86, 2.20, 0.105), black, 0.065, 5))
    lid_parts.append(box("Display bezel", (0, 0.45, 0.060), (3.72, 2.06, 0.025), graphite, 0.047, 5))
    lid_parts.append(box("Screen glass", (0, 0.46, 0.077), (3.59, 1.93, 0.012), glass, 0.035, 5))
    # Bright red angular display shapes provide a restrained ROG-style screen image.
    for idx, (cx, cy, width, height) in enumerate([(0.56, 0.44, 1.38, .075), (.25, .27, .90, .035), (.78, .66, 1.10, .035)]):
        slash = box("Display red slash", (cx, cy, 0.086), (width, height, .004), rgb_red if idx == 0 else rgb_pink, .008, 2)
        slash.rotation_euler.z = -0.38
        lid_parts.append(slash)
    lid_parts.append(text_mesh("ROG display mark", "ROG", (0.0, 0.48, .091), .45, rgb_red,
                               rotation=(0, 0, 0), extrude=.0007))
    # Small centered camera at the top bezel.
    lid_parts.append(sphere("Webcam", (0, 1.45, 0.078), (.021, .021, .014), dark, 20, 12))
    # The low-profile rear housing logo is visible on the reverse when orbiting around.
    lid_parts.append(text_mesh("ROG lid logo", "REPUBLIC OF GAMERS", (0, .45, -.055), .14, silver,
                               rotation=(0, math.pi, 0), extrude=.0005))
    for part in lid_parts:
        # The screen center is at the rear hinge (z = -1.30), not at the chassis center.
        part.location.z -= 1.30
        part.parent = pivot
        part.matrix_parent_inverse = pivot.matrix_world.inverted()
    pivot.rotation_euler.x = -0.14
    # The hinge barrels and their caps remain anchored to the base.
    for side in (-1, 1):
        cylinder("Display hinge barrel", (side * 1.31, -0.69, -1.29), .07, .50, dark, "X", 32, .008)
        cylinder("Hinge cap", (side * 1.60, -0.69, -1.29), .073, .10, silver, "X", 32, .008)


def key_color_for_f75(label, row_name, accent, navy):
    if label in {"Esc", "Enter", "Space", "Up", "Down", "Left", "Right", "Delete", "PgUp", "PgDn", "End"}:
        return navy if label in {"Esc", "Enter", "Space", "Up", "Down", "Left", "Right"} else accent
    if row_name == "function" and label in {"F5", "F6", "F7", "F8"}:
        return accent
    if label in {"Tab", "Caps", "Shift", "Ctrl", "Win", "Alt", "Fn", "Backspace"}:
        return accent
    return None


def create_keyboard(mats):
    body, plate, offwhite, blue, navy, legends, white_legend, silver, dark, rubber, led = mats
    # AULA F75: 322.7 x 143.2 mm case, 75 percent / 80-key arrangement.
    box("AULA F75 rounded shell", (0, -0.11, 0), (3.30, .25, 1.455), body, .105, 6)
    box("Black switch plate", (0, .021, -.002), (3.17, .026, 1.34), plate, .075, 5)
    # A continuous gasket line visible along the exposed perimeter.
    path("Case seam", roundrect_loop(0, .022, 0, 3.20, 1.365, .10, 8), .008, dark, cyclic=True, resolution=2)

    pitch = .192
    key_w = .169
    key_d = .156
    key_h = .104
    top_y = .256
    key_rows = [
        ("number", -.37, [("`", 1), ("1", 1), ("2", 1), ("3", 1), ("4", 1), ("5", 1), ("6", 1), ("7", 1), ("8", 1), ("9", 1), ("0", 1), ("-", 1), ("=", 1), ("Backspace", 2), ("Delete", 1)]),
        ("qwerty", -.15, [("Tab", 1.5), ("Q", 1), ("W", 1), ("E", 1), ("R", 1), ("T", 1), ("Y", 1), ("U", 1), ("I", 1), ("O", 1), ("P", 1), ("[", 1), ("]", 1), ("\\", 1.2), ("PgUp", 1)]),
        ("home", .07, [("Caps", 1.75), ("A", 1), ("S", 1), ("D", 1), ("F", 1), ("G", 1), ("H", 1), ("J", 1), ("K", 1), ("L", 1), (";", 1), ("'", 1), ("Enter", 2.15), ("PgDn", 1)]),
        ("shift", .29, [("Shift", 2.15), ("Z", 1), ("X", 1), ("C", 1), ("V", 1), ("B", 1), ("N", 1), ("M", 1), (",", 1), (".", 1), ("/", 1), ("Shift", 1.75), ("Up", 1), ("End", 1)]),
        ("bottom", .51, [("Ctrl", 1.25), ("Win", 1.25), ("Alt", 1.25), ("Space", 6.25), ("Fn", 1.25), ("Ctrl", 1.25), ("Left", 1), ("Down", 1), ("Right", 1)]),
    ]
    for row_name, z, row in key_rows:
        width_units = sum(width for _, width in row)
        x = -width_units * pitch / 2
        for key_index, (label, units) in enumerate(row):
            width = (units - .075) * pitch
            center_x = x + units * pitch / 2
            key_material = key_color_for_f75(label, row_name, blue, navy) or offwhite
            box(f"AULA {row_name} key {key_index + 1:02d} {label}",
                (center_x, top_y - key_h / 2, z), (width, key_h, key_d), key_material, .024, 4)
            if key_material == navy:
                legend_material = white_legend
            else:
                legend_material = legends
            caption = "←" if label == "Left" else "↓" if label == "Down" else "→" if label == "Right" else "↑" if label == "Up" else label
            if label in {"Tab", "Caps", "Backspace", "Delete", "PgUp", "PgDn", "Enter", "Shift", "Space", "Ctrl", "Win", "Alt", "Fn"}:
                caption = {"Backspace": "←", "Delete": "Del", "Space": "", "Shift": "Shift", "Enter": "↵"}.get(label, caption)
            if caption:
                size = .040 if len(caption) > 2 else .055
                label_on_top(f"AULA {label} legend", caption, center_x, top_y + .001, z - .012, size, legend_material)
            # Row's left-to-right positions use key units exactly as the F75 staggered grid.
            x += units * pitch

    # Dedicated function row and white volume wheel, matching the supplied white/blue layout.
    func_pitch = .203
    # Esc is separated from three groups of four function keys.
    box("AULA Esc key", (-1.48, top_y - key_h / 2, -.595), (.178, key_h, .148), navy, .024, 4)
    label_on_top("AULA Esc legend", "Esc", -1.48, top_y + .001, -.607, .052, white_legend)
    groups = [(["F1", "F2", "F3", "F4"], -.96), (["F5", "F6", "F7", "F8"], -.05), (["F9", "F10", "F11", "F12"], .91)]
    for keys, group_center in groups:
        for index, label in enumerate(keys):
            x = group_center + (index - 1.5) * func_pitch
            key_material = blue if label in {"F5", "F6", "F7", "F8"} else offwhite
            box(f"AULA {label} key", (x, top_y - key_h / 2, -.595), (.177, key_h, .148), key_material, .024, 4)
            label_on_top(f"AULA {label} legend", label, x, top_y + .001, -.607, .047, legends)
    # Small mode/status stripe and metallic encoder at the top right.
    box("AULA status slot", (-1.265, .162, -.595), (.025, .010, .133), dark, .008, 3)
    cylinder("F75 dial body", (1.48, .192, -.595), .123, .097, silver, "Y", 56, .01)
    cylinder("F75 dial grip", (1.48, .245, -.595), .101, .019, offwhite, "Y", 56, .007)
    cylinder("F75 dial inset", (1.48, .257, -.595), .070, .008, silver, "Y", 48, .003)
    # The front lip has a subtle centered AULA mark; four rubber feet are visible underneath.
    text_mesh("AULA case maker mark", "AULA", (0, -.108, .735), .095, silver,
              rotation=(0, 0, 0), extrude=.0005)
    for x in (-1.35, 1.35):
        for z in (-.52, .52):
            box("Keyboard nonslip foot", (x, -.242, z), (.43, .05, .20), rubber, .022, 3)
    for x in (-1.3, 1.3):
        box("Keyboard flip foot", (x, -.285, -.53), (.46, .042, .12), rubber, .025, 3)


def create_mouse(mats):
    shell, click, side, rubber, silver, cyan, led_magenta, led_blue, led_green, gold, dockmat = mats
    sections = [
        (-.645, .105, .10), (-.58, .205, .23), (-.43, .275, .35),
        (-.22, .316, .405), (-.02, .322, .375), (.20, .302, .325),
        (.42, .275, .275), (.57, .235, .225), (.645, .205, .145),
    ]
    rounded_hull("Attack Shark X11 sculpted upper shell", sections, shell, 40)
    # Switch caps are thin curved surfaces sitting on the same continuous hull.
    # Their rear edges and center gap are visible, without square blocks at the nose.
    def shell_profile(z):
        for left, right in zip(sections, sections[1:]):
            if z <= right[0]:
                t = max(0, min(1, (z - left[0]) / (right[0] - left[0])))
                t = t * t * (3 - 2 * t)
                return (left[1] + (right[1] - left[1]) * t,
                        left[2] + (right[2] - left[2]) * t)
        return sections[-1][1:]

    def shell_top(x, z):
        width, height = shell_profile(z)
        arc = math.sqrt(max(0, 1 - (x / width) ** 2))
        return .045 + (.5 + .5 * arc) * height

    for sign, label in ((-1, "left"), (1, "right")):
        verts, faces = [], []
        rows, columns = 27, 13
        for row in range(rows):
            z = .105 + (.515 * row / (rows - 1))
            width, _ = shell_profile(z)
            # A shallow wheel cutout narrows both inner edges near the wheel.
            wheel_notch = .075 * max(0, 1 - abs(z - .315) / .16)
            inner = .018 + wheel_notch
            outer = width * .89
            for column in range(columns):
                x = sign * (inner + (outer - inner) * column / (columns - 1))
                verts.append((x, shell_top(x, z) + .009, z))
        for row in range(rows - 1):
            for column in range(columns - 1):
                i = row * columns + column
                face = (i, i + columns, i + columns + 1, i + 1)
                faces.append(face if sign == 1 else tuple(reversed(face)))
        mesh = bpy.data.meshes.new(f"X11 {label} click surface")
        mesh.from_pydata(verts, [], faces)
        mesh.materials.append(click)
        mesh.update()
        obj = bpy.data.objects.new(f"X11 {label} click surface", mesh)
        bpy.context.collection.objects.link(obj)
        for polygon in mesh.polygons:
            polygon.use_smooth = True

        edge_points = []
        for row in range(rows):
            z = .105 + (.515 * row / (rows - 1))
            wheel_notch = .075 * max(0, 1 - abs(z - .315) / .16)
            x = sign * (.018 + wheel_notch)
            edge_points.append((x, shell_top(x, z) + .011, z))
        path(f"X11 {label} center button gap", edge_points, .0028, rubber, resolution=2)

    rear_seam = []
    rear_width, _ = shell_profile(.105)
    for index in range(25):
        x = rear_width * .89 * (index / 12 - 1)
        rear_seam.append((x, shell_top(x, .105) + .011, .105))
    path("X11 curved click rear seam", rear_seam, .0035, rubber, resolution=2)
    # Side seams follow the shell perimeter and separate the snap-on body from its base.
    for side_sign in (-1, 1):
        points = []
        for z, width, height in sections[1:-1]:
            points.append((side_sign * width * .985, .045 + height * .48, z))
        path("Shell side seam", points, .006, rubber, resolution=3)
    # The wheel rises only slightly above the keys; dark narrow rims frame its tread.
    wheel_center = (0, .323, .325)
    wheel_radius = .087
    wheel_rim = material("X11 graphite wheel rim", (.25, .27, .29), .34, .34)
    cylinder("X11 scroll wheel", wheel_center, wheel_radius, .135, rubber, "X", 48, .004)
    for x in (-.073, .073):
        cylinder("Scroll wheel narrow trim", (x, wheel_center[1], wheel_center[2]),
                 wheel_radius + .002, .009, wheel_rim, "X", 48, .002)
    for i in range(28):
        angle = i * TAU / 28
        y = wheel_center[1] + math.sin(angle) * (wheel_radius + .001)
        z = wheel_center[2] + math.cos(angle) * (wheel_radius + .001)
        rod("Scroll wheel rib", (-.061, y, z), (.061, y, z), .0027, side, 8)
    # Left thumb buttons, tactile breaks, and aqua status light on the top shell.
    for index, z in enumerate((-.13, .075)):
        box(f"X11 side thumb button {index + 1}", (-.291, .275, z), (.023, .045, .17), side, .009, 4)
    box("X11 status LED", (0, shell_top(0, -.30) + .011, -.30), (.075, .009, .023), cyan, .008, 4)
    # Feet, optical lens and wireless selector on the underside.
    for x in (-.205, .205):
        box("X11 PTFE glide", (x, .044, -.43), (.105, .012, .19), rubber, .006, 5)
        box("X11 PTFE glide", (x, .044, .44), (.105, .012, .22), rubber, .006, 5)
    sphere("Optical sensor", (0, .042, .005), (.052, .007, .052), silver, 24, 12)
    box("Mode selector recess", (0, .042, -.20), (.092, .008, .105), rubber, .004, 4)
    box("X11 receiver label", (0, .042, -.55), (.20, .004, .032), darken(shell), .002, 2)
    # Manufacturer docking station: ramped cradle, charging pins, removable receiver and RGB lower rim.
    dock_existing = {obj.name for obj in bpy.context.scene.objects}
    box("X11 RGB dock lower base", (-.84, -.40, -.36), (1.00, .14, .86), dockmat, .105, 6)
    box("X11 RGB diffuser band", (-.84, -.479, -.36), (.96, .026, .81), darken(dockmat), .09, 5)
    color_strip = [led_magenta, led_blue, cyan, led_green]
    for index in range(30):
        angle = TAU * index / 30
        x = -.84 + .455 * math.cos(angle)
        z = -.36 + .385 * math.sin(angle)
        box("RGB charging dock segment", (x, -.497, z), (.079, .024, .058), color_strip[index % len(color_strip)], .021, 3)
    box("Dock sloped cradle", (-.84, -.275, -.37), (.77, .40, .61), dockmat, .075, 5).rotation_euler.x = -.24
    box("Dock contact plate", (-.84, -.057, -.48), (.53, .019, .33), side, .033, 4).rotation_euler.x = -.24
    for x in (-.93, -.75):
        cylinder("Dock charging pin", (x, -.035, -.46), .026, .052, gold, "Y", 24, .003)
    box("USB-C receiver cap", (-.84, -.40, .095), (.23, .18, .16), shell, .04, 4)
    text_mesh("Dock brand mark", "ATTACK SHARK", (-.84, -.29, -.675), .105, silver,
              rotation=(math.pi / 2, 0, 0), extrude=.0005)
    # The dock is set farther back in the product reference and must not dwarf the mouse.
    dock_origin = Vector((-.84, -.34, -.36))
    for obj in bpy.context.scene.objects:
        if obj.name in dock_existing:
            continue
        obj.location = dock_origin + (obj.location - dock_origin) * .72 + Vector((.11, 0, 0))
        obj.scale *= .72
    bpy.context.view_layer.update()


def create_earbuds(mats):
    case_top, case_lower, case_seam, stemmat, stem_edge, rubber, logo, light, fabric = mats
    # R50i charging case: soft-square 55 x 48 mm pebble with lower shell and defined lid.
    box("R50i lower case", (0, -.58, 0), (1.98, .37, 1.02), case_lower, .235, 8)
    box("R50i top lid", (0, -.285, 0), (1.99, .27, 1.025), case_top, .235, 8)
    path("R50i lid join", roundrect_loop(0, -.445, 0, 1.925, .94, .22, 12), .008, case_seam, cyclic=True, resolution=3)
    # Soft-touch brand emblem, tiny front indicator, and charging port/lanyard clasp.
    sphere("Soundcore emblem round", (0, -.143, -.015), (.083, .009, .083), logo, 28, 16)
    box("Soundcore emblem stem", (0, -.143, .115), (.048, .009, .10), logo, .02, 4)
    box("Case indicator LED", (0, -.60, .514), (.033, .014, .016), light, .008, 3)
    box("Case USB-C port", (0, -.58, -.519), (.19, .095, .016), rubber, .047, 5)
    # Fabric loop: separate woven strands and a rubber brand slider reproduce the supplied reference.
    loop_points = [(-.90, -.53, .16), (-1.12, -.57, .26), (-1.40, -.67, .27),
                   (-1.62, -.81, .20), (-1.57, -.95, .08), (-1.29, -.98, .035),
                   (-1.00, -.89, .07), (-.91, -.58, .15)]
    path("Braided carry lanyard", loop_points, .034, fabric, resolution=5)
    path("Lanyard highlight thread", [(x, y + .021, z) for x, y, z in loop_points], .003, logo, resolution=2)
    box("Lanyard keeper", (-1.23, -.69, .245), (.31, .19, .24), case_top, .10, 6)
    sphere("Lanyard keeper logo", (-1.23, -.588, .245), (.052, .008, .052), logo, 24, 16)

    def make_bud(side, center_x, center_z):
        sign = -1 if side == "L" else 1
        stem_angle = sign * math.radians(12)
        sphere(f"R50i {side} earbud speaker body", (center_x, .51, center_z), (.235, .205, .225), stemmat, 36, 24)
        sphere(f"R50i {side} outer touch shell", (center_x, .535, center_z + .074), (.185, .15, .18), stem_edge, 32, 20)
        # Silicone nozzle and conical tip angle outward from the rounded driver head.
        cylinder(f"R50i {side} sound nozzle", (center_x - sign * .176, .49, center_z - .017), .080, .14, rubber, "X", 28, .008)
        sphere(f"R50i {side} silicone tip", (center_x - sign * .247, .49, center_z - .017), (.126, .12, .128), rubber, 32, 20)
        # The long, rounded stem has a brighter metallic edge and recessed touch panel.
        stem = box(f"R50i {side} stem shell", (center_x + sign * .12, .235, center_z + .105), (.178, .52, .17), stemmat, .078, 7)
        stem.rotation_euler.z = stem_angle
        panel = box(f"R50i {side} stem touch panel", (center_x + sign * .12, .238, center_z + .194), (.123, .39, .012), case_top, .058, 6)
        panel.rotation_euler.z = stem_angle
        for y in (.37, .06):
            sphere(f"R50i {side} mic grille", (center_x + sign * .12, y, center_z + .207), (.021, .012, .018), rubber, 18, 10)
        sphere(f"R50i {side} status glint", (center_x + sign * .12, .385, center_z + .21), (.027, .009, .026), logo, 20, 12)

    make_bud("L", -.51, .02)
    make_bud("R", .51, -.06)
    # Include a subtly textured fabric braid along the loop; the main product silhouette remains clean.
    for index in range(15):
        t = index / 14
        angle = t * TAU * 2
        x = -1.02 - .54 * math.sin(t * math.pi) + .012 * math.cos(angle)
        y = -.65 - .30 * math.sin(t * math.pi) + .012 * math.sin(angle)
        z = .20 - .10 * math.sin(t * math.pi) + .012 * math.cos(angle)
        sphere("Lanyard weave knot", (x, y, z), (.022, .022, .022), logo, 12, 8)


def create_phone(mats):
    frame, rear, edge, hinge, glass, camera_ring, lens, led, wallpaper, black = mats
    width = 1.5588   # Samsung unfolded width 129.9 mm at 12 mm/unit
    height = 1.8588  # 154.9 mm at 12 mm/unit
    half = width / 2
    panel_w = half - .018
    thickness = .0732
    panel_center = half / 2
    # Two thin Armor Aluminum halves with a true center joint and visible antenna bands.
    for side in (-1, 1):
        cx = side * panel_center
        box("Fold5 Armor Aluminum frame", (cx, 0, 0), (panel_w, height, thickness), frame, .055, 6)
        box("Icy Blue back glass", (cx, 0, -.046), (panel_w - .035, height - .035, .014), rear, .046, 6)
        box("Inner display gasket", (cx, 0, .040), (panel_w - .036, height - .04, .012), edge, .045, 5)
        box("Dynamic AMOLED 2X inner panel", (cx, 0, .048), (panel_w - .060, height - .065, .012), glass, .04, 5)
        if side == 1:
            sphere("Inner selfie camera", (cx + side * .22, height * .42, .062), (.021, .021, .008), black, 24, 14)
        # Power and volume keys are inset along the frame's right rail.
        if side == 1:
            box("Fold5 volume rocker", (cx + panel_w / 2 + .006, .29, 0), (.02, .25, .032), hinge, .01, 3)
            box("Fold5 power fingerprint key", (cx + panel_w / 2 + .006, .02, 0), (.021, .15, .034), edge, .01, 3)
        # Antenna breaks on the outer rails.
        for y in (-.70, .67):
            box("Frame antenna band", (cx + side * (panel_w / 2 - .003), y, 0), (.012, .022, .079), edge, .004, 2)
    # One continuous wallpaper spans both display halves with a small crease over the hinge.
    screen_plane("Fold5 full-width inner display wallpaper", 0, 0, .057, width - .104, height - .065, wallpaper)
    box("Main screen fold crease", (0, 0, .060), (.008, height - .13, .0015), edge, .004, 3)
    # Multiple hinge barrels visible from the edge; the outer caps and center spine follow Samsung's seam.
    for index in range(5):
        y = -.70 + index * .35
        cylinder("Fold5 hinge barrel", (0, y, 0), .057, .265, hinge, "Y", 40, .008)
        cylinder("Fold5 hinge end cap", (0, y - .141, 0), .046, .018, edge, "Y", 32, .003)
    box("Fold5 continuous hinge shell", (0, 0, -.012), (.128, height - .11, .094), hinge, .048, 6)
    # Outer cover glass on the right leaf, and three separate rings/lenses on left back panel.
    right_cx = panel_center
    box("Fold5 Cover Screen bezel", (right_cx, 0, -.057), (panel_w - .085, height - .10, .012), black, .055, 6)
    box("Fold5 cover AMOLED", (right_cx, 0, -.065), (panel_w - .115, height - .14, .010), glass, .045, 6)
    screen_plane("Fold5 cover display wallpaper", right_cx, 0, -.071, panel_w - .115, height - .14,
                 wallpaper, faces_front=False)
    sphere("Cover selfie camera", (right_cx, height * .425, -.078), (.023, .023, .007), black, 20, 12)
    left_cx = -panel_center
    camera_x = left_cx - .19
    for index, y in enumerate((.60, .29, -.02)):
        cylinder("Fold5 camera surround", (camera_x, y, -.065), .119, .056, camera_ring, "Z", 48, .008)
        cylinder("Fold5 camera lens", (camera_x, y, -.098), .090, .024, lens, "Z", 48, .005)
        sphere("Fold5 camera optics", (camera_x, y, -.113), (.042, .042, .009), black, 24, 14)
        sphere("Camera lens glint", (camera_x - .020, y + .020, -.123), (.010, .010, .003), edge, 16, 8)
    sphere("Fold5 flash", (left_cx + .14, .59, -.058), (.028, .028, .014), led, 24, 14)
    # USB-C opening and microphone/speaker ports around the bottom edge.
    box("Fold5 USB-C opening", (0, -height / 2 - .005, -.004), (.19, .017, .040), black, .018, 4)
    for index in range(7):
        x = -.62 + index * .205
        cylinder("Fold5 speaker perforation", (x, -height / 2 - .006, .011), .012, .016, black, "Y", 16)
    cylinder("Fold5 mic opening", (.45, -height / 2 - .007, .009), .008, .016, black, "Y", 12)


def silver_blue():
    return material("Cool silver antenna paint", (.63, .70, .86), .3, .48)


def oled_wallpaper_material():
    """Create a small, embedded blue gradient for the Fold5 OLED displays."""
    width, height = 384, 768
    image = bpy.data.images.new("Fold5 blue night wallpaper", width=width, height=height, alpha=False)
    pixels = []
    stars = {(x * 73 % width, x * 151 % height): .35 + (x % 6) * .08 for x in range(42)}
    for row in range(height):
        v = row / (height - 1)
        for col in range(width):
            u = col / (width - 1)
            dx, dy = (u - .38) / .82, (v - .49) / 1.1
            glow = math.exp(-((dx * dx + dy * dy) * 3.8))
            ring_distance = math.sqrt((u - .91) ** 2 + (v - .54) ** 2)
            arc = math.exp(-((ring_distance - .62) / .055) ** 2)
            edge = max(0.0, min(1.0, (u - .72) * 1.6))
            base, bloom, deep = (.008, .012, .027), (.33, .40, .70), (.095, .13, .29)
            color = [base[i] * (1 - glow) + bloom[i] * glow for i in range(3)]
            for channel in range(3):
                color[channel] = (color[channel] * (1 - arc * .58) + deep[channel] * arc * .58) * (1 - edge * .70)
            star = stars.get((col, row))
            if star:
                color = [min(1.0, channel + star) for channel in color]
            pixels.extend((color[0], color[1], color[2], 1.0))
    image.pixels.foreach_set(pixels)
    image.pack()

    mat = material("Fold5 blue OLED wallpaper", (.16, .20, .39), .30, .05, (.07, .09, .20), .24)
    shader = mat.node_tree.nodes.get("Principled BSDF")
    texture = mat.node_tree.nodes.new("ShaderNodeTexImage")
    texture.name = "Embedded Fold5 wallpaper"
    texture.image = image
    texture.interpolation = "Linear"
    mat.node_tree.links.new(texture.outputs["Color"], shader.inputs["Base Color"])
    mat.node_tree.links.new(texture.outputs["Color"], shader.inputs["Emission Color"])
    return mat


def screen_plane(name, center_x, center_y, z, width, height, mat, faces_front=True):
    vertices = [
        (center_x - width / 2, center_y - height / 2, z),
        (center_x + width / 2, center_y - height / 2, z),
        (center_x + width / 2, center_y + height / 2, z),
        (center_x - width / 2, center_y + height / 2, z),
    ]
    face = (0, 1, 2, 3) if faces_front else (3, 2, 1, 0)
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], [face])
    mesh.materials.append(mat)
    uv = mesh.uv_layers.new(name="Wallpaper UV")
    loop_uvs = ((0, 0), (1, 0), (1, 1), (0, 1))
    for polygon in mesh.polygons:
        for loop_index, uv_coord in zip(polygon.loop_indices, loop_uvs):
            uv.data[loop_index].uv = uv_coord
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return obj


def build_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    mats = {
        "black": material("ROG charcoal magnesium", (.055, .059, .067), .43, .35),
        "graphite": material("Deep graphite", (.093, .098, .106), .54, .22),
        "dark": material("Recess black", (.012, .014, .018), .62, .08),
        "key": material("Keyboard near-black keys", (.025, .028, .034), .5, .12),
        "legend": material("Key legends warm white", (.86, .87, .88), .56),
        "white": material("Warm white legends", (.98, .98, .99), .4),
        "red": material("ROG scarlet", (.8, .018, .038), .28, .15, (.63, .01, .03), .9),
        "pink": material("RGB magenta", (.92, .035, .36), .26, .05, (.66, .005, .17), .8),
        "glass": material("OLED glass", (.012, .019, .034), .22, .17),
        "silver": material("Brushed aluminum", (.63, .66, .70), .28, .82),
        "rubber": material("Dark rubber", (.018, .020, .024), .89, .02),
        "rgbblue": material("Dock RGB blue", (.10, .38, 1), .3, .08, (.02, .1, 1), 1.2),
        "rgbgreen": material("Dock RGB green", (.28, .94, .06), .3, .06, (.12, .72, .015), 1.2),
        "cyan": material("Cyan indicator", (.03, .84, .86), .26, .05, (.02, .71, .75), 1.1),
        "magenta": material("Magenta indicator", (.92, .015, .5), .28, .05, (.80, .005, .25), 1.1),
        "blackplastic": material("Satin black plastic", (.048, .053, .061), .47, .13),
        "mouseclick": material("Mouse click surface", (.057, .063, .071), .44, .12),
        "side": material("Mouse inset trim", (.065, .071, .080), .53, .14),
        "gold": material("Dock charging pin gold", (.82, .60, .19), .25, .82),
        "dock": material("X11 charging dock polymer", (.025, .030, .037), .43, .26),
        "case": material("R50i smooth case upper shell", (.060, .065, .073), .34, .12),
        "casebottom": material("R50i lower shell", (.043, .046, .052), .48, .09),
        "caseseam": material("R50i case seam", (.014, .016, .019), .71, .02),
        "stem": material("R50i satin stem", (.050, .055, .063), .36, .20),
        "stemedge": material("R50i glossy driver rim", (.10, .108, .12), .26, .26),
        "earrubber": material("Silicone eartips", (.021, .023, .027), .91, .01),
        "brand": material("Soft dark logo", (.018, .020, .024), .37, .18),
        "status": material("Case indicator", (.86, .88, .92), .25, .02, (.45, .48, .55), .25),
        "fabric": material("Braided nylon lanyard", (.027, .029, .033), .86, .02),
        "icy": material("Icy Blue Fold5 rear glass", (.57, .64, .83), .26, .37),
        "frame": material("Fold5 Armor Aluminum", (.56, .63, .80), .25, .74),
        "edge": material("Fold5 polished rail", (.70, .77, .91), .24, .78),
        "hinge": material("Fold5 hinge blue titanium", (.43, .51, .67), .29, .72),
        "camera": material("Camera ring chrome", (.74, .79, .87), .21, .84),
        "lens": material("Camera lens coated glass", (.015, .027, .055), .13, .39),
        "wallpaper": oled_wallpaper_material(),
        "f75body": material("AULA warm white shell", (.91, .90, .86), .48, .06),
        "f75plate": material("AULA dark switch tray", (.016, .020, .029), .56, .10),
        "f75white": material("AULA ivory keycap", (.92, .91, .87), .46, .02),
        "f75blue": material("AULA powder blue keycap", (.48, .65, .79), .43, .03),
        "f75navy": material("AULA midnight modifier key", (.035, .046, .071), .44, .05),
        "f75legend": material("AULA black legends", (.018, .021, .026), .58, .01),
        "f75whlegend": material("AULA ivory legends", (.91, .93, .96), .5),
    }
    models = [
        ("rog-strix-g713qe", lambda: create_laptop([mats[k] for k in ("black", "graphite", "dark", "key", "legend", "red", "pink", "glass", "silver")])),
        ("aula-f75", lambda: create_keyboard([mats[k] for k in ("f75body", "f75plate", "f75white", "f75blue", "f75navy", "f75legend", "f75whlegend", "silver", "dark", "rubber", "pink")])),
        ("attack-shark-x11", lambda: create_mouse([mats[k] for k in ("blackplastic", "mouseclick", "side", "rubber", "silver", "cyan", "magenta", "rgbblue", "rgbgreen", "gold", "dock")])),
        ("soundcore-r50i", lambda: create_earbuds([mats[k] for k in ("case", "casebottom", "caseseam", "stem", "stemedge", "earrubber", "brand", "status", "fabric")])),
        ("galaxy-z-fold5", lambda: create_phone([mats[k] for k in ("frame", "icy", "edge", "hinge", "glass", "camera", "lens", "status", "wallpaper", "dark")])),
    ]
    only_name = next((argument.split("=", 1)[1] for argument in sys.argv if argument.startswith("--only=")), None)
    if only_name:
        models = [model for model in models if model[0] == only_name]
        if not models:
            raise ValueError(f"No gear model named {only_name!r}")
    return models


def export_model(name, builder):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    builder()
    # Convert the Y-up modeling coordinates into Blender's Z-up space first.
    # The glTF exporter's Y-up conversion then returns the intended Y-up GLB.
    orientation = Matrix.Rotation(math.pi / 2, 4, "X")
    top_level = [obj for obj in bpy.context.scene.objects if obj.parent is None]
    for obj in top_level:
        obj.matrix_world = orientation @ obj.matrix_world
    bpy.context.view_layer.update()
    # Recenter around the complete product so browser rotation keeps it in place.
    bpy.context.view_layer.update()
    coords = []
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        coords.extend(obj.matrix_world @ Vector(corner) for corner in obj.bound_box)
    if not coords:
        raise RuntimeError(f"{name} produced no mesh geometry")
    min_x = min(p.x for p in coords); max_x = max(p.x for p in coords)
    min_y = min(p.y for p in coords); max_y = max(p.y for p in coords)
    min_z = min(p.z for p in coords); max_z = max(p.z for p in coords)
    center = Vector(((min_x + max_x) / 2, (min_y + max_y) / 2, (min_z + max_z) / 2))
    for obj in top_level:
        obj.location -= center
    # Baked product-relative coordinates avoid transform drift in GLTF viewers.
    bpy.context.view_layer.update()
    active_object = None
    for obj in bpy.context.scene.objects:
        if obj.type not in {"MESH", "CURVE", "FONT"}:
            continue
        obj.select_set(True)
        active_object = active_object or obj
    bpy.context.view_layer.objects.active = active_object
    output = OUTPUT_DIR / f"{name}.glb"
    bpy.ops.export_scene.gltf(
        filepath=str(output), export_format="GLB", use_selection=True,
        export_apply=True, export_yup=True, export_texcoords=True,
        export_normals=True, export_tangents=False, export_materials="EXPORT",
        export_cameras=False, export_lights=False, export_animations=False,
        export_draco_mesh_compression_enable=False,
    )
    size_mb = output.stat().st_size / (1024 * 1024)
    print(f"Exported {output.name}: {size_mb:.2f} MB; bounds {max_x-min_x:.3f} × {max_y-min_y:.3f} × {max_z-min_z:.3f}")
    if size_mb > 8:
        raise RuntimeError(f"{output.name} exceeds the 8 MB asset budget")


def render_review(name, views):
    if not REVIEW_DIR:
        return
    REVIEW_DIR.mkdir(parents=True, exist_ok=True)
    mesh_objs = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    corners = [obj.matrix_world @ Vector(corner) for obj in mesh_objs for corner in obj.bound_box]
    minimum = Vector((min(p.x for p in corners), min(p.y for p in corners), min(p.z for p in corners)))
    maximum = Vector((max(p.x for p in corners), max(p.y for p in corners), max(p.z for p in corners)))
    center = (minimum + maximum) / 2
    size = (maximum - minimum).length
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 16
    scene.render.resolution_x = 480
    scene.render.resolution_y = 380
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = True
    scene.view_settings.view_transform = "AgX"
    world = bpy.data.worlds.new("Review studio") if not bpy.data.worlds else bpy.data.worlds[0]
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (.055, .06, .075, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = .3
    scene.world = world
    for light_name, loc, power, area in [
        ("Key softbox", (4, 5, 7), 620, 5),
        ("Fill softbox", (-5, 2, 3), 480, 4),
        ("Rim softbox", (1, 4, -6), 740, 3),
    ]:
        data = bpy.data.lights.new(light_name, "AREA")
        data.energy = power
        data.shape = "DISK"
        data.size = area
        light_obj = bpy.data.objects.new(light_name, data)
        scene.collection.objects.link(light_obj)
        light_obj.location = loc
        light_obj.rotation_euler = (Vector(center) - light_obj.location).to_track_quat("-Z", "Z").to_euler()
    camera_data = bpy.data.cameras.new("Review camera")
    camera = bpy.data.objects.new("Review camera", camera_data)
    scene.collection.objects.link(camera)
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = size * 1.48
    scene.camera = camera
    for view_name, direction in views:
        # Review viewpoints are specified in the site's Y-up coordinates.
        x, y, z = direction
        direction = Vector((x, -z, y)).normalized()
        camera.location = center + direction * (size * 3)
        camera_up = "Y" if abs(direction.z) > .92 else "Z"
        camera.rotation_euler = (-direction).to_track_quat("-Z", camera_up).to_euler()
        scene.render.filepath = str(REVIEW_DIR / f"{name}-{view_name}.png")
        bpy.ops.render.render(write_still=True)


def write_provenance():
    text = """# Gear model sources and inferred details

These original GLB files were built in Blender from the product images provided in
the portfolio and public manufacturer specifications. No third-party mesh is used.

| Asset | Measured/reference basis | Inferred or simplified details |
| --- | --- | --- |
| `rog-strix-g713qe.glb` | ASUS ROG Strix G17 G713, 395 × 282 mm chassis, 17.3-inch panel, supplied open-laptop cutout | Bottom panel grille and feet, port shapes, exact key legends and unseen hinge internals are representative; the hinge remains open at a fixed angle. |
| `aula-f75.glb` | AULA F75, 322.7 × 143.2 mm case, supplied white/powder-blue/navy 75% reference, 80-key layout | Switch internals, exact legend font, back switches and underside label are simplified. |
| `attack-shark-x11.glb` | X11, 128 × 64 × 40 mm, supplied black mouse and RGB dock image | Underside selector, sensor ring, unseen dock connectors and internal fit are representative. |
| `soundcore-r50i.glb` | Supplied black R50i product image and manufacturer user guide | Case underside, ports, inner contact wells, ear tip openings and internal audio-driver geometry are representative. |
| `galaxy-z-fold5.glb` | Fold5 opened dimensions 129.9 × 154.9 × 6.1 mm, Icy Blue finish, supplied opened product image | Fold seam, antenna/port locations, inner camera, hinge segments and hidden lower frame details are representative. |

The models are detailed product illustrations, not factory CAD files or exact 1:1
copies. They are intended for transparent, real-time portfolio previews.
"""
    (OUTPUT_DIR / "README.md").write_text(text, encoding="utf-8")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    models = build_scene()
    front_views = {
        "rog-strix-g713qe": (2.6, 6.0, 7.2),
        "aula-f75": (.7, 4.6, 5.8),
        "attack-shark-x11": (-3.2, 6.5, 5.8),
        "soundcore-r50i": (1.2, 5.0, 6.4),
        "galaxy-z-fold5": (3.9, 2.45, 6.7),
    }
    review_only = "--review-existing" in sys.argv
    for name, builder in models:
        if review_only:
            bpy.ops.object.select_all(action="SELECT")
            bpy.ops.object.delete(use_global=False)
            bpy.ops.import_scene.gltf(filepath=str(OUTPUT_DIR / f"{name}.glb"))
        else:
            export_model(name, builder)
            if not REVIEW_DIR:
                continue
            # Review the exact exported files in Blender from six useful angles.
            bpy.ops.object.select_all(action="SELECT")
            bpy.ops.object.delete(use_global=False)
            bpy.ops.import_scene.gltf(filepath=str(OUTPUT_DIR / f"{name}.glb"))
        review_views = [
        ("front", front_views[name]),
        ("rear", (-3.8, 2.4, -7.0)),
        ("left", (-7.0, 2.2, 3.8)),
        ("right", (7.0, 2.2, 3.8)),
        ("top", (0, 9, .2)),
        ("underside", (0, -9, -.2)),
        ]
        if REVIEW_DIR:
            render_review(name, review_views)
    if not review_only:
        write_provenance()


if __name__ == "__main__":
    main()
